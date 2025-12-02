package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"gosporty-backend/database"
	"gosporty-backend/models"
)

// 🔹 Thêm sản phẩm
func CreateProduct(w http.ResponseWriter, r *http.Request) {
	var p models.Product
	json.NewDecoder(r.Body).Decode(&p)

	p.ID = primitive.NewObjectID()
	p.CreatedAt = primitive.NewDateTimeFromTime(time.Now())
	p.UpdatedAt = primitive.NewDateTimeFromTime(time.Now())

	coll := database.DB.Collection("products")
	_, err := coll.InsertOne(context.TODO(), p)
	if err != nil {
		http.Error(w, "Không thể thêm sản phẩm", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": "Tạo sản phẩm thành công"})
}

type PagedProducts struct {
	Total    int64            `json:"total"`
	Page     int              `json:"page"`
	Limit    int              `json:"limit"`
	Pages    int              `json:"pages"`
	Products []models.Product `json:"products"`
}

func GetProducts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	q := r.URL.Query()

	// pagination
	page, _ := strconv.Atoi(q.Get("page"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(q.Get("limit"))
	if limit <= 0 {
		limit = 12
	}

	// filters
	category := strings.TrimSpace(q.Get("category"))
	subcategory := strings.TrimSpace(q.Get("subcategory"))
	search := strings.TrimSpace(q.Get("search"))
	sortParam := strings.TrimSpace(q.Get("sort"))

	filter := bson.M{}
	if category != "" {
		filter["category"] = category
	}
	if subcategory != "" {
		filter["subcategory"] = bson.M{"$regex": subcategory, "$options": "i"}
	}
	if search != "" {
		filter["$or"] = bson.A{
			bson.M{"name": bson.M{"$regex": search, "$options": "i"}},
			bson.M{"description": bson.M{"$regex": search, "$options": "i"}},
		}
	}

	// sort
	sort := bson.D{{Key: "createdAt", Value: -1}}
	switch sortParam {
	case "price_asc":
		sort = bson.D{{Key: "price", Value: 1}}
	case "price_desc":
		sort = bson.D{{Key: "price", Value: -1}}
	case "newest":
		sort = bson.D{{Key: "createdAt", Value: -1}}
	}

	coll := database.DB.Collection("products")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	total, err := coll.CountDocuments(ctx, filter)
	if err != nil {
		http.Error(w, "count error", http.StatusInternalServerError)
		return
	}

	findOpts := options.Find()
	findOpts.SetSort(sort)
	findOpts.SetSkip(int64((page - 1) * limit))
	findOpts.SetLimit(int64(limit))

	cursor, err := coll.Find(ctx, filter, findOpts)
	if err != nil {
		http.Error(w, "find error", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var products []models.Product
	if err := cursor.All(ctx, &products); err != nil {
		http.Error(w, "cursor error", http.StatusInternalServerError)
		return
	}

	pages := int((total + int64(limit) - 1) / int64(limit))
	resp := PagedProducts{
		Total:    total,
		Page:     page,
		Limit:    limit,
		Pages:    pages,
		Products: products,
	}
	json.NewEncoder(w).Encode(resp)
}

// 🔹 THÊM MỚI: Lấy chi tiết sản phẩm theo ID
// GetProductByID returns product details by ObjectId
func GetProductByID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	params := mux.Vars(r)
	id := params["id"]

	// Validate ObjectId length first
	if len(id) != 24 {
		http.Error(w, "Invalid product ID format (must be 24 characters)", http.StatusBadRequest)
		return
	}

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid product ID", http.StatusBadRequest)
		return
	}

	collection := database.GetCollection("products")
	var product models.Product

	err = collection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&product)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "Product not found", http.StatusNotFound)
		} else {
			http.Error(w, "Error retrieving product", http.StatusInternalServerError)
		}
		return
	}

	json.NewEncoder(w).Encode(product)
}

// 🔹 THÊM MỚI: Lấy chi tiết sản phẩm theo Slug
func GetProductBySlug(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	slug := vars["slug"]

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	coll := database.DB.Collection("products")

	var product models.Product
	err := coll.FindOne(ctx, bson.M{"slug": slug}).Decode(&product)

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Không tìm thấy sản phẩm"})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(product)
}

// 🔹 THÊM MỚI: Cập nhật sản phẩm
func UpdateProduct(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "ID sản phẩm không hợp lệ"})
		return
	}

	var product models.Product
	if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Dữ liệu không hợp lệ"})
		return
	}

	product.UpdatedAt = primitive.NewDateTimeFromTime(time.Now())

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	coll := database.DB.Collection("products")

	update := bson.M{
		"$set": bson.M{
			"name":          product.Name,
			"description":   product.Description,
			"price":         product.Price,
			"originalPrice": product.OriginalPrice,
			"discount":      product.Discount,
			"image":         product.Image,
			"images":        product.Images,
			"category":      product.Category,
			"subcategory":   product.Subcategory,
			"brand":         product.Brand,
			"slug":          product.Slug,
			"stock":         product.Stock,
			"colors":        product.Colors,
			"sizes":         product.Sizes,
			"features":      product.Features,
			"updatedAt":     product.UpdatedAt,
		},
	}

	result, err := coll.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	if result.MatchedCount == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Không tìm thấy sản phẩm"})
		return
	}

	product.ID = objectID

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Cập nhật sản phẩm thành công",
		"product": product,
	})
}

// 🔹 THÊM MỚI: Xóa sản phẩm
func DeleteProduct(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "ID sản phẩm không hợp lệ"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	coll := database.DB.Collection("products")

	result, err := coll.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	if result.DeletedCount == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Không tìm thấy sản phẩm"})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Xóa sản phẩm thành công"})
}

// 🔹 THÊM MỚI: Lấy sản phẩm liên quan
func GetRelatedProducts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]

	log.Println("📌 GetRelatedProducts called with ID:", id)

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "ID sản phẩm không hợp lệ"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	coll := database.DB.Collection("products")

	// Lấy sản phẩm hiện tại để biết category
	var currentProduct models.Product
	err = coll.FindOne(ctx, bson.M{"_id": objectID}).Decode(&currentProduct)
	if err != nil {
		log.Println("❌ Current product not found:", err)
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Không tìm thấy sản phẩm"})
		return
	}

	// Tìm sản phẩm cùng category, khác ID
	filter := bson.M{
		"category": currentProduct.Category,
		"_id":      bson.M{"$ne": objectID},
	}

	findOpts := options.Find()
	findOpts.SetLimit(8)
	findOpts.SetSort(bson.D{{Key: "createdAt", Value: -1}})

	cursor, err := coll.Find(ctx, filter, findOpts)
	if err != nil {
		log.Println("❌ Error finding related products:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	var products []models.Product
	if err := cursor.All(ctx, &products); err != nil {
		log.Println("❌ Error decoding products:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	// Trả về mảng rỗng thay vì null nếu không có sản phẩm
	if products == nil {
		products = []models.Product{}
	}

	log.Printf("✅ Found %d related products\n", len(products))

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(products)
}
