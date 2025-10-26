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
	clientURL := os.Getenv("CLIENT_URL")
	if clientURL == "" {
		clientURL = "https://go-sporty-htuq.vercel.app" // URL frontend Vercel của bạn
	}

	log.Println("Allowing CORS for client:", clientURL)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{clientURL},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)

	// =================================================================
	// SỬA Ở ĐÂY 2: Dùng port động của Vercel
	// =================================================================
	port := os.Getenv("PORT")
	if port == "" {
		port = "10000" // fallback khi chạy local
	}
	log.Println("Server running on port:", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))

}
