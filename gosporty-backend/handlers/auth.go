package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"gosporty-backend/database"
	"gosporty-backend/models"
)

var jwtSecret = []byte("SECRET_KEY")

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var user models.User
	json.NewDecoder(r.Body).Decode(&user)

	user.ID = primitive.NewObjectID()

	coll := database.DB.Collection("users")

	// check email exists
	var exists models.User
	coll.FindOne(context.TODO(), bson.M{"email": user.Email}).Decode(&exists)
	if exists.Email != "" {
		http.Error(w, "Email already used", http.StatusBadRequest)
		return
	}

	_, err := coll.InsertOne(context.TODO(), user)
	if err != nil {
		http.Error(w, "Register failed", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Register success"})
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var creds models.User
	json.NewDecoder(r.Body).Decode(&creds)

	coll := database.DB.Collection("users")

	var user models.User
	err := coll.FindOne(context.TODO(), bson.M{"email": creds.Email, "password": creds.Password}).Decode(&user)
	if err == mongo.ErrNoDocuments {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": user.Email,
		"exp":   time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenStr, _ := token.SignedString(jwtSecret)
	json.NewEncoder(w).Encode(map[string]string{"token": tokenStr})
}
