package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"gosporty-backend/database"
)

type DashboardStats struct {
	TotalRevenue    float64 `json:"totalRevenue"`
	TotalOrders     int64   `json:"totalOrders"`
	TotalUsers      int64   `json:"totalUsers"`
	TotalProducts   int64   `json:"totalProducts"`
	TodayRevenue    float64 `json:"todayRevenue"`
	TodayOrders     int64   `json:"todayOrders"`
	PendingOrders   int64   `json:"pendingOrders"`
	CompletedOrders int64   `json:"completedOrders"`
}

type UserStats struct {
	ID          string  `json:"_id" bson:"_id"`
	Name        string  `json:"name" bson:"name"`
	Email       string  `json:"email" bson:"email"`
	Phone       string  `json:"phone" bson:"phone"`
	Role        string  `json:"role" bson:"role"`
	IsAdmin     bool    `json:"isAdmin" bson:"isAdmin"`
	Status      string  `json:"status" bson:"status"`
	TotalOrders int     `json:"totalOrders"`
	TotalSpent  float64 `json:"totalSpent"`
	JoinDate    string  `json:"joinDate" bson:"createdAt"`
	LastLogin   string  `json:"lastLogin" bson:"lastLogin"`
}

// GetDashboardStats - Lấy thống kê tổng quan
func GetDashboardStats(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var stats DashboardStats

	// Count total users
	usersCount, err := database.DB.Collection("users").CountDocuments(ctx, bson.M{})
	if err != nil {
		log.Println("❌ Error counting users:", err)
	}
	stats.TotalUsers = usersCount

	// Count total products
	productsCount, err := database.DB.Collection("products").CountDocuments(ctx, bson.M{})
	if err != nil {
		log.Println("❌ Error counting products:", err)
	}
	stats.TotalProducts = productsCount

	// Count total orders
	ordersCount, err := database.DB.Collection("orders").CountDocuments(ctx, bson.M{})
	if err != nil {
		log.Println("❌ Error counting orders:", err)
	}
	stats.TotalOrders = ordersCount

	// Calculate total revenue
	pipeline := mongo.Pipeline{
		{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: nil},
			{Key: "totalRevenue", Value: bson.D{{Key: "$sum", Value: "$total"}}},
		}}},
	}

	cursor, err := database.DB.Collection("orders").Aggregate(ctx, pipeline)
	if err == nil {
		var results []bson.M
		if err = cursor.All(ctx, &results); err == nil && len(results) > 0 {
			if total, ok := results[0]["totalRevenue"].(float64); ok {
				stats.TotalRevenue = total
			} else if total, ok := results[0]["totalRevenue"].(int32); ok {
				stats.TotalRevenue = float64(total)
			} else if total, ok := results[0]["totalRevenue"].(int64); ok {
				stats.TotalRevenue = float64(total)
			}
		}
	}

	// Today's stats
	today := time.Now()
	startOfDay := time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, today.Location())

	todayFilter := bson.M{
		"createdAt": bson.M{"$gte": startOfDay},
	}

	stats.TodayOrders, _ = database.DB.Collection("orders").CountDocuments(ctx, todayFilter)

	// Today's revenue
	todayPipeline := mongo.Pipeline{
		{{Key: "$match", Value: todayFilter}},
		{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: nil},
			{Key: "todayRevenue", Value: bson.D{{Key: "$sum", Value: "$total"}}},
		}}},
	}

	cursor, err = database.DB.Collection("orders").Aggregate(ctx, todayPipeline)
	if err == nil {
		var results []bson.M
		if err = cursor.All(ctx, &results); err == nil && len(results) > 0 {
			if total, ok := results[0]["todayRevenue"].(float64); ok {
				stats.TodayRevenue = total
			}
		}
	}

	// Pending and completed orders
	stats.PendingOrders, _ = database.DB.Collection("orders").CountDocuments(ctx, bson.M{"status": "Đang xử lý"})
	stats.CompletedOrders, _ = database.DB.Collection("orders").CountDocuments(ctx, bson.M{"status": "Hoàn thành"})

	log.Printf("📊 Dashboard stats: Users=%d, Products=%d, Orders=%d, Revenue=%.0f\n",
		stats.TotalUsers, stats.TotalProducts, stats.TotalOrders, stats.TotalRevenue)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(stats)
}

// GetUsersWithStats - Lấy danh sách users với thống kê
func GetUsersWithStats(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get all users
	cursor, err := database.DB.Collection("users").Find(ctx, bson.M{})
	if err != nil {
		log.Println("❌ Error fetching users:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch users"})
		return
	}
	defer cursor.Close(ctx)

	var users []UserStats
	for cursor.Next(ctx) {
		var user UserStats
		if err := cursor.Decode(&user); err != nil {
			continue
		}

		// Set role based on isAdmin
		if user.IsAdmin {
			user.Role = "admin"
		} else {
			user.Role = "user"
		}

		// Set default status if not exists
		if user.Status == "" {
			user.Status = "active"
		}

		// Count orders for this user
		orderCount, _ := database.DB.Collection("orders").CountDocuments(ctx, bson.M{"userId": user.ID})
		user.TotalOrders = int(orderCount)

		// Calculate total spent
		pipeline := mongo.Pipeline{
			{{Key: "$match", Value: bson.M{"userId": user.ID}}},
			{{Key: "$group", Value: bson.D{
				{Key: "_id", Value: nil},
				{Key: "totalSpent", Value: bson.D{{Key: "$sum", Value: "$total"}}},
			}}},
		}

		cursor2, err := database.DB.Collection("orders").Aggregate(ctx, pipeline)
		if err == nil {
			var results []bson.M
			if err = cursor2.All(ctx, &results); err == nil && len(results) > 0 {
				if total, ok := results[0]["totalSpent"].(float64); ok {
					user.TotalSpent = total
				} else if total, ok := results[0]["totalSpent"].(int32); ok {
					user.TotalSpent = float64(total)
				} else if total, ok := results[0]["totalSpent"].(int64); ok {
					user.TotalSpent = float64(total)
				}
			}
			cursor2.Close(ctx)
		}

		users = append(users, user)
	}

	log.Printf("✅ Fetched %d users with stats\n", len(users))

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(users)
}

// GetRecentOrders - Lấy đơn hàng gần đây
// GetRecentOrders - PHẢI format data đúng
func GetRecentOrders(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.Find().SetLimit(10).SetSort(bson.D{{Key: "createdAt", Value: -1}})

	cursor, err := database.DB.Collection("orders").Find(ctx, bson.M{}, opts)
	if err != nil {
		log.Println("❌ Error fetching orders:", err)
		w.WriteHeader(http.StatusOK)          // ✅ Trả về 200 với array rỗng
		json.NewEncoder(w).Encode([]bson.M{}) // ✅ Empty array thay vì error
		return
	}
	defer cursor.Close(ctx)

	var orders []bson.M
	if err = cursor.All(ctx, &orders); err != nil {
		log.Println("❌ Error decoding orders:", err)
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode([]bson.M{})
		return
	}

	// ✅ Nếu không có orders, trả về empty array
	if orders == nil {
		orders = []bson.M{}
	}

	log.Printf("✅ Fetched %d recent orders\n", len(orders))

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(orders)
}

// GetTopProducts - Lấy top sản phẩm bán chạy
func GetTopProducts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Aggregate to get top selling products
	pipeline := mongo.Pipeline{
		{{Key: "$unwind", Value: "$items"}},
		{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: "$items.productId"},
			{Key: "name", Value: bson.D{{Key: "$first", Value: "$items.name"}}},
			{Key: "image", Value: bson.D{{Key: "$first", Value: "$items.image"}}},
			{Key: "sold", Value: bson.D{{Key: "$sum", Value: "$items.qty"}}},
			{Key: "revenue", Value: bson.D{{Key: "$sum", Value: bson.D{
				{Key: "$multiply", Value: bson.A{"$items.price", "$items.qty"}},
			}}}},
		}}},
		{{Key: "$sort", Value: bson.D{{Key: "sold", Value: -1}}}},
		{{Key: "$limit", Value: 5}},
	}

	cursor, err := database.DB.Collection("orders").Aggregate(ctx, pipeline)
	if err != nil {
		log.Println("❌ Error aggregating top products:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to get top products"})
		return
	}
	defer cursor.Close(ctx)

	var topProducts []bson.M
	if err = cursor.All(ctx, &topProducts); err != nil {
		log.Println("❌ Error decoding top products:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to decode top products"})
		return
	}

	log.Printf("✅ Fetched %d top products\n", len(topProducts))

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(topProducts)
}
