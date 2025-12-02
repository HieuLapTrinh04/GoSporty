package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"

	"gosporty-backend/database"
)

type User struct {
	ID       primitive.ObjectID `json:"_id" bson:"_id,omitempty"`
	Email    string             `json:"email" bson:"email"`
	Password string             `json:"password,omitempty" bson:"password"`
	Name     string             `json:"name" bson:"name"`
	IsAdmin  bool               `json:"isAdmin" bson:"isAdmin"` // ✅ Add this
}

// JWT Claims - PHẢI KHỚP VỚI MIDDLEWARE
type Claims struct {
	UserID string `json:"userId"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

var jwtSecret = []byte(getJWTSecret())

func getJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "SECRET_KEY"
	}
	return secret
}

// LoginHandler - Login user
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var loginData struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&loginData); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request"})
		return
	}

	// Validate input
	if loginData.Email == "" || loginData.Password == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Email and password required"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find user by email
	coll := database.DB.Collection("users")
	var user User
	err := coll.FindOne(ctx, bson.M{"email": loginData.Email}).Decode(&user)

	if err != nil {
		log.Println("❌ User not found:", loginData.Email)
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid email or password"})
		return
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginData.Password))
	if err != nil {
		log.Println("❌ Invalid password for:", loginData.Email)
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid email or password"})
		return
	}

	// ✅ CRITICAL: Tạo JWT token với userId là STRING
	userIDStr := user.ID.Hex() // Chuyển ObjectID sang string

	claims := &Claims{
		UserID: userIDStr, // ✅ Phải là string
		Email:  user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * 7 * time.Hour)), // 7 days
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   userIDStr, // ✅ Subject cũng là userId
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)

	if err != nil {
		log.Println("❌ Failed to generate token:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to generate token"})
		return
	}

	// Don't send password back
	user.Password = ""

	log.Printf("✅ User logged in: %s (ID: %s)\n", user.Email, userIDStr)

	// Return token and user info
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token": tokenString,
		"user": map[string]interface{}{
			"_id":     user.ID,
			"email":   user.Email,
			"name":    user.Name,
			"isAdmin": user.IsAdmin, // ✅ Add this
		},
	})
}

// RegisterHandler - Register new user
func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var newUser User
	if err := json.NewDecoder(r.Body).Decode(&newUser); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request"})
		return
	}

	// Validate
	if newUser.Email == "" || newUser.Password == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Email and password required"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if user exists
	coll := database.DB.Collection("users")
	var existing User
	err := coll.FindOne(ctx, bson.M{"email": newUser.Email}).Decode(&existing)
	if err == nil {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{"error": "Email already exists"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newUser.Password), bcrypt.DefaultCost)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to hash password"})
		return
	}

	newUser.Password = string(hashedPassword)
	newUser.ID = primitive.NewObjectID()

	// Insert user
	_, err = coll.InsertOne(ctx, newUser)
	if err != nil {
		log.Println("❌ Failed to create user:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create user"})
		return
	}

	// Generate token for new user
	userIDStr := newUser.ID.Hex()

	claims := &Claims{
		UserID: userIDStr,
		Email:  newUser.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * 7 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   userIDStr,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)

	if err != nil {
		log.Println("❌ Failed to generate token:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to generate token"})
		return
	}

	// Don't send password back
	newUser.Password = ""

	log.Printf("✅ New user registered: %s (ID: %s)\n", newUser.Email, userIDStr)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token": tokenString,
		"user": map[string]interface{}{
			"_id":   newUser.ID,
			"email": newUser.Email,
			"name":  newUser.Name,
		},
	})
}
