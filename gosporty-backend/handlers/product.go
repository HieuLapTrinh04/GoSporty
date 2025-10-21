package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
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

	coll := database.DB.Collection("products")
	_, err := coll.InsertOne(context.TODO(), p)
	if err != nil {
		http.Error(w, "Không thể thêm sản phẩm", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": "Tạo sản phẩm thành công"})
}

// 🔹 Lấy tất cả sản phẩm
// 🔹 Lấy tất cả sản phẩm (sắp xếp theo CreatedAt từ mới đến cũ)
func GetProducts(w http.ResponseWriter, r *http.Request) {
	coll := database.DB.Collection("products")

	// Sắp xếp theo CreatedAt giảm dần
	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})

	cursor, err := coll.Find(context.TODO(), bson.M{}, opts)
	if err != nil {
		http.Error(w, "Không thể truy xuất sản phẩm", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	var products []models.Product
	cursor.All(context.TODO(), &products)

	json.NewEncoder(w).Encode(products)
}
