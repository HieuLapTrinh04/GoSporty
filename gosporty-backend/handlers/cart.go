package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type CartItem struct {
	ProductID     string  `json:"productId" bson:"productId"`
	Qty           int     `json:"qty" bson:"qty"`
	SelectedColor string  `json:"selectedColor" bson:"selectedColor"`
	SelectedSize  string  `json:"selectedSize" bson:"selectedSize"`
	Price         float64 `json:"price" bson:"price"`
	Name          string  `json:"name" bson:"name"`
	Image         string  `json:"image" bson:"image"`
}

type Cart struct {
	ID        primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	UserID    string             `json:"userId" bson:"userId"`
	Items     []CartItem         `json:"items" bson:"items"`
	UpdatedAt time.Time          `json:"updatedAt" bson:"updatedAt"`
}

var cartCollection *mongo.Collection

// InitCartCollection - Khởi tạo collection
func InitCartCollection(db *mongo.Database) {
	cartCollection = db.Collection("carts")

	// Tạo index cho userId
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	indexModel := mongo.IndexModel{
		Keys:    bson.D{{Key: "userId", Value: 1}},
		Options: options.Index().SetUnique(true),
	}

	_, err := cartCollection.Indexes().CreateOne(ctx, indexModel)
	if err != nil {
		log.Println("⚠️ Warning: Could not create cart index:", err)
	} else {
		log.Println("✅ Cart collection initialized with index")
	}
}

// GetUserIDFromContext - Helper để lấy userID từ context
func GetUserIDFromContext(r *http.Request) (string, bool) {
	userID := r.Context().Value("userId")
	if userID == nil {
		return "", false
	}

	userIDStr, ok := userID.(string)
	return userIDStr, ok
}

// GetCart - Lấy giỏ hàng của user
func GetCart(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	userID, ok := GetUserIDFromContext(r)
	if !ok {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(Cart{Items: []CartItem{}})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	var cart Cart
	err := cartCollection.FindOne(ctx, bson.M{"userId": userID}).Decode(&cart)
	if err == mongo.ErrNoDocuments {
		// Chưa có cart -> trả về cart rỗng
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(Cart{Items: []CartItem{}})
		return
	}

	if err != nil {
		log.Println("❌ GetCart error:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch cart"})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(cart)
}

// AddToCart - Thêm sản phẩm vào giỏ hàng
func AddToCart(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// ✅ FIX: Cho phép add cart cả khi chưa login (optional auth)
	userID, ok := GetUserIDFromContext(r)
	if !ok {
		// Nếu không có userID -> trả về thông báo cần login
		// Frontend sẽ fallback về localStorage
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Please login to sync cart"})
		return
	}

	log.Println("📝 AddToCart - UserID:", userID)

	var newItem CartItem
	if err := json.NewDecoder(r.Body).Decode(&newItem); err != nil {
		log.Println("❌ AddToCart decode error:", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	// Validate
	if newItem.ProductID == "" || newItem.Qty < 1 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid product data"})
		return
	}

	// Set defaults
	if newItem.SelectedColor == "" {
		newItem.SelectedColor = "Mặc định"
	}
	if newItem.SelectedSize == "" {
		newItem.SelectedSize = "One Size"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	var cart Cart
	err := cartCollection.FindOne(ctx, bson.M{"userId": userID}).Decode(&cart)

	if err == mongo.ErrNoDocuments {
		// Tạo cart mới
		cart = Cart{
			UserID:    userID,
			Items:     []CartItem{newItem},
			UpdatedAt: time.Now(),
		}

		_, err = cartCollection.InsertOne(ctx, cart)
		if err != nil {
			log.Println("❌ AddToCart insert error:", err)
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create cart"})
			return
		}

		log.Println("✅ Created new cart for user:", userID)
	} else if err != nil {
		log.Println("❌ AddToCart find error:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Database error"})
		return
	} else {
		// Cart đã tồn tại - kiểm tra item đã có chưa
		found := false
		for i := range cart.Items {
			if cart.Items[i].ProductID == newItem.ProductID &&
				cart.Items[i].SelectedColor == newItem.SelectedColor &&
				cart.Items[i].SelectedSize == newItem.SelectedSize {
				// Item đã tồn tại -> tăng quantity
				cart.Items[i].Qty += newItem.Qty
				found = true
				log.Println("✅ Updated existing item quantity")
				break
			}
		}

		if !found {
			// Item chưa có -> thêm mới
			cart.Items = append(cart.Items, newItem)
			log.Println("✅ Added new item to cart")
		}

		cart.UpdatedAt = time.Now()

		// Update cart
		_, err = cartCollection.UpdateOne(
			ctx,
			bson.M{"userId": userID},
			bson.M{
				"$set": bson.M{
					"items":     cart.Items,
					"updatedAt": cart.UpdatedAt,
				},
			},
		)

		if err != nil {
			log.Println("❌ AddToCart update error:", err)
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to update cart"})
			return
		}
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(cart)
}

// UpdateCartItem - Cập nhật số lượng item
func UpdateCartItem(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	userID, ok := GetUserIDFromContext(r)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	var updateData struct {
		ProductID     string `json:"productId"`
		SelectedColor string `json:"selectedColor"`
		SelectedSize  string `json:"selectedSize"`
		Qty           int    `json:"qty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var cart Cart
	err := cartCollection.FindOne(ctx, bson.M{"userId": userID}).Decode(&cart)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Cart not found"})
		return
	}

	// Tìm và update item
	found := false
	newItems := []CartItem{}

	for _, item := range cart.Items {
		if item.ProductID == updateData.ProductID &&
			item.SelectedColor == updateData.SelectedColor &&
			item.SelectedSize == updateData.SelectedSize {

			if updateData.Qty >= 1 {
				item.Qty = updateData.Qty
				newItems = append(newItems, item)
			}
			// Nếu qty < 1 thì không add vào newItems (xóa item)
			found = true
		} else {
			newItems = append(newItems, item)
		}
	}

	if !found {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Item not found in cart"})
		return
	}

	cart.Items = newItems
	cart.UpdatedAt = time.Now()

	_, err = cartCollection.UpdateOne(
		ctx,
		bson.M{"userId": userID},
		bson.M{
			"$set": bson.M{
				"items":     cart.Items,
				"updatedAt": cart.UpdatedAt,
			},
		},
	)

	if err != nil {
		log.Println("❌ UpdateCartItem error:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to update cart"})
		return
	}

	log.Println("✅ Cart item updated successfully")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(cart)
}

// RemoveItem - Xóa item khỏi giỏ hàng
func RemoveItem(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	userID, ok := GetUserIDFromContext(r)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	var removeData struct {
		ProductID     string `json:"productId"`
		SelectedColor string `json:"selectedColor"`
		SelectedSize  string `json:"selectedSize"`
	}

	if err := json.NewDecoder(r.Body).Decode(&removeData); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var cart Cart
	err := cartCollection.FindOne(ctx, bson.M{"userId": userID}).Decode(&cart)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Cart not found"})
		return
	}

	// Remove item
	newItems := []CartItem{}
	for _, item := range cart.Items {
		if !(item.ProductID == removeData.ProductID &&
			item.SelectedColor == removeData.SelectedColor &&
			item.SelectedSize == removeData.SelectedSize) {
			newItems = append(newItems, item)
		}
	}

	cart.Items = newItems
	cart.UpdatedAt = time.Now()

	_, err = cartCollection.UpdateOne(
		ctx,
		bson.M{"userId": userID},
		bson.M{
			"$set": bson.M{
				"items":     cart.Items,
				"updatedAt": cart.UpdatedAt,
			},
		},
	)

	if err != nil {
		log.Println("❌ RemoveItem error:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to remove item"})
		return
	}

	log.Println("✅ Item removed successfully")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(cart)
}

// ClearCart - Xóa toàn bộ giỏ hàng
func ClearCart(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	userID, ok := GetUserIDFromContext(r)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := cartCollection.DeleteOne(ctx, bson.M{"userId": userID})
	if err != nil {
		log.Println("❌ ClearCart error:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to clear cart"})
		return
	}

	log.Println("✅ Cart cleared successfully")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Cart cleared successfully"})
}
