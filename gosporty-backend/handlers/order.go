package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"

	"gosporty-backend/database"
)

// OrderItem - Item trong order
type OrderItem struct {
	ProductID     string  `json:"productId" bson:"productId"`
	Name          string  `json:"name" bson:"name"`
	Price         float64 `json:"price" bson:"price"`
	Qty           int     `json:"qty" bson:"qty"`
	Image         string  `json:"image" bson:"image"`
	SelectedColor string  `json:"selectedColor" bson:"selectedColor"`
	SelectedSize  string  `json:"selectedSize" bson:"selectedSize"`
}

// Order - Đơn hàng
// Order - Đơn hàng
type Order struct {
	ID            primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	UserID        string             `json:"userId,omitempty" bson:"userId,omitempty"`
	CustomerName  string             `json:"customerName" bson:"customerName"`
	CustomerEmail string             `json:"customerEmail" bson:"customerEmail"`
	CustomerPhone string             `json:"customerPhone" bson:"customerPhone"`
	Address       string             `json:"address" bson:"address"`
	Note          string             `json:"note,omitempty" bson:"note,omitempty"`
	Items         []OrderItem        `json:"items" bson:"items"`
	Total         float64            `json:"total" bson:"total"`
	Status        string             `json:"status" bson:"status"`
	PaymentMethod string             `json:"paymentMethod" bson:"paymentMethod"`
	CancelReason  string             `json:"cancelReason,omitempty" bson:"cancelReason,omitempty"` // ✅ Thêm
	CancelledAt   *time.Time         `json:"cancelledAt,omitempty" bson:"cancelledAt,omitempty"`   // ✅ Thêm
	CreatedAt     time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt     time.Time          `json:"updatedAt" bson:"updatedAt"`
}

// GetOrders - Lấy orders của user (tự động từ token)
func GetOrders(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{}

	// ✅ Ưu tiên lấy userId từ context (từ JWT token qua middleware)
	if userID, ok := r.Context().Value("userId").(string); ok && userID != "" {
		filter["userId"] = userID
		log.Println("✅ Filtering orders for userId from token:", userID)
	} else if queryUserID := r.URL.Query().Get("userId"); queryUserID != "" {
		// Fallback: lấy từ query params nếu không có token
		filter["userId"] = queryUserID
		log.Println("⚠️ Filtering orders for userId from query:", queryUserID)
	} else {
		log.Println("⚠️ No userId found - returning empty array")
	}

	log.Println("📋 Final filter:", filter)

	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})

	cursor, err := database.DB.Collection("orders").Find(ctx, filter, opts)
	if err != nil {
		log.Println("❌ Error finding orders:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Không thể lấy danh sách đơn hàng",
		})
		return
	}
	defer cursor.Close(ctx)

	var orders []Order
	if err = cursor.All(ctx, &orders); err != nil {
		log.Println("❌ Error decoding orders:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Không thể xử lý dữ liệu",
		})
		return
	}

	// Nếu không có orders, trả về array rỗng thay vì null
	if orders == nil {
		orders = []Order{}
	}

	log.Printf("✅ Returning %d orders\n", len(orders))
	json.NewEncoder(w).Encode(orders)
}

// GetAllOrders - Lấy TẤT CẢ orders (dành cho admin) - KHÔNG filter theo userId
func GetAllOrders(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// KHÔNG filter gì cả - lấy tất cả orders cho admin
	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})

	cursor, err := database.DB.Collection("orders").Find(ctx, bson.M{}, opts)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Không thể lấy danh sách đơn hàng",
		})
		return
	}
	defer cursor.Close(ctx)

	var orders []Order
	if err = cursor.All(ctx, &orders); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Không thể xử lý dữ liệu",
		})
		return
	}

	// Nếu không có orders, trả về array rỗng thay vì null
	if orders == nil {
		orders = []Order{}
	}

	json.NewEncoder(w).Encode(orders)
}

// GetOrderByID - Lấy 1 order theo ID
func GetOrderByID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	params := mux.Vars(r)
	id := params["id"]

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "ID đơn hàng không hợp lệ",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var order Order
	err = database.DB.Collection("orders").FindOne(ctx, bson.M{"_id": objectID}).Decode(&order)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Không tìm thấy đơn hàng",
		})
		return
	}

	json.NewEncoder(w).Encode(order)
}

// CreateOrder - Tạo order mới
func CreateOrder(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var order Order
	if err := json.NewDecoder(r.Body).Decode(&order); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Dữ liệu không hợp lệ",
		})
		return
	}

	// Validation
	if order.CustomerName == "" || order.CustomerEmail == "" ||
		order.CustomerPhone == "" || order.Address == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Vui lòng điền đầy đủ thông tin khách hàng",
		})
		return
	}

	if len(order.Items) == 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Đơn hàng phải có ít nhất 1 sản phẩm",
		})
		return
	}

	if order.Total <= 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Tổng tiền không hợp lệ",
		})
		return
	}

	// Lấy userId từ context (nếu user đã login)
	if userID, ok := r.Context().Value("userId").(string); ok && userID != "" {
		order.UserID = userID
	}

	// Set default values
	order.Status = "Chờ xác nhận"
	if order.PaymentMethod == "" {
		order.PaymentMethod = "COD"
	}
	order.CreatedAt = time.Now()
	order.UpdatedAt = time.Now()

	// Set default cho items
	for i := range order.Items {
		if order.Items[i].SelectedColor == "" {
			order.Items[i].SelectedColor = "Mặc định"
		}
		if order.Items[i].SelectedSize == "" {
			order.Items[i].SelectedSize = "One Size"
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := database.DB.Collection("orders").InsertOne(ctx, order)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error":   "Không thể tạo đơn hàng",
			"message": err.Error(),
		})
		return
	}

	order.ID = result.InsertedID.(primitive.ObjectID)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(order)
}

// UpdateOrderStatus - Cập nhật trạng thái order (chỉ admin)
func UpdateOrderStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	params := mux.Vars(r)
	id := params["id"]

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "ID đơn hàng không hợp lệ",
		})
		return
	}

	var updateData struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Dữ liệu không hợp lệ",
		})
		return
	}

	if updateData.Status == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Trạng thái không được để trống",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"status":    updateData.Status,
			"updatedAt": time.Now(),
		},
	}

	result, err := database.DB.Collection("orders").UpdateOne(ctx, bson.M{"_id": objectID}, update)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Không thể cập nhật đơn hàng",
		})
		return
	}

	if result.MatchedCount == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Không tìm thấy đơn hàng",
		})
		return
	}

	var updatedOrder Order
	database.DB.Collection("orders").FindOne(ctx, bson.M{"_id": objectID}).Decode(&updatedOrder)
	json.NewEncoder(w).Encode(updatedOrder)
}

// DeleteOrder - Xóa order (chỉ admin)
func DeleteOrder(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	params := mux.Vars(r)
	id := params["id"]

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "ID đơn hàng không hợp lệ",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := database.DB.Collection("orders").DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Không thể xóa đơn hàng",
		})
		return
	}

	if result.DeletedCount == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Không tìm thấy đơn hàng",
		})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Đã xóa đơn hàng thành công",
	})
}

// CancelOrder - Hủy đơn hàng (user hoặc admin)
func CancelOrder(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	params := mux.Vars(r)
	id := params["id"]

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "ID đơn hàng không hợp lệ",
		})
		return
	}

	var cancelData struct {
		CancelReason string `json:"cancelReason"`
		Status       string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&cancelData); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Dữ liệu không hợp lệ",
		})
		return
	}

	if cancelData.CancelReason == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Vui lòng chọn lý do hủy đơn",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Kiểm tra đơn hàng tồn tại
	var existingOrder Order
	err = database.DB.Collection("orders").FindOne(ctx, bson.M{"_id": objectID}).Decode(&existingOrder)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Không tìm thấy đơn hàng",
		})
		return
	}

	// Kiểm tra trạng thái hiện tại - chỉ cho phép hủy đơn "Chờ xác nhận"
	if existingOrder.Status != "Chờ xác nhận" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Không thể hủy đơn hàng đã được xác nhận hoặc đang giao",
		})
		return
	}

	// Kiểm tra quyền: user chỉ được hủy đơn của mình
	if userID, ok := r.Context().Value("userId").(string); ok && userID != "" {
		if existingOrder.UserID != userID {
			w.WriteHeader(http.StatusForbidden)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "Bạn không có quyền hủy đơn hàng này",
			})
			return
		}
	}

	// Cập nhật trạng thái và lý do hủy
	now := time.Now()
	update := bson.M{
		"$set": bson.M{
			"status":       "Đã hủy",
			"cancelReason": cancelData.CancelReason,
			"cancelledAt":  now,
			"updatedAt":    now,
		},
	}

	result, err := database.DB.Collection("orders").UpdateOne(ctx, bson.M{"_id": objectID}, update)
	if err != nil {
		log.Println("❌ Error cancelling order:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Không thể hủy đơn hàng",
		})
		return
	}

	if result.MatchedCount == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Không tìm thấy đơn hàng",
		})
		return
	}

	// Lấy đơn hàng đã cập nhật
	var cancelledOrder Order
	database.DB.Collection("orders").FindOne(ctx, bson.M{"_id": objectID}).Decode(&cancelledOrder)

	log.Printf("✅ Order cancelled successfully - ID: %s, Reason: %s\n", id, cancelData.CancelReason)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Đã hủy đơn hàng thành công",
		"order":   cancelledOrder,
	})
}
