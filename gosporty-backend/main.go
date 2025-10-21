package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/rs/cors"

	"gosporty-backend/database"
	"gosporty-backend/handlers"
	"gosporty-backend/middlewares"
)

func main() {
	database.ConnectDB()

	r := mux.NewRouter()

	api := r.PathPrefix("/api").Subrouter()

	// Auth routes
	api.HandleFunc("/register", handlers.RegisterHandler).Methods("POST")
	api.HandleFunc("/login", handlers.LoginHandler).Methods("POST")

	// Product routes
	api.HandleFunc("/products", handlers.GetProducts).Methods("GET")
	api.HandleFunc("/products", middlewares.VerifyJWT(handlers.CreateProduct)).Methods("POST")

	// Profile test
	api.HandleFunc("/profile", middlewares.VerifyJWT(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Welcome to your profile"))
	})).Methods("GET")

	// =================================================================
	// SỬA Ở ĐÂY 1: Cấu hình CORS chuẩn cho Vercel và Local
	// =================================================================
	clientURL := os.Getenv("CLIENT_URL") // Lấy URL frontend từ biến môi trường
	if clientURL == "" {
		clientURL = "http://localhost:3000" // Fallback cho local dev (React thường chạy ở 3000)
	}

	log.Println("Allowing CORS for client:", clientURL)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{clientURL}, // Chỉ cho phép URL này
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"}, // Cho phép gửi kèm token
		AllowCredentials: true,
	})

	handler := c.Handler(r)

	// =================================================================
	// SỬA Ở ĐÂY 2: Dùng port động của Vercel
	// =================================================================
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Dùng port 8080 khi chạy local (nếu PORT không được set)
	}

	log.Println("✅ Server running on port:", port)
	log.Fatal(http.ListenAndServe(":"+port, handler)) // <-- Dùng biến port
}
