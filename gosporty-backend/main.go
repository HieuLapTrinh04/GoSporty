package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/mux"
	"github.com/rs/cors"

	"gosporty-backend/database"
	"gosporty-backend/handlers"
	"gosporty-backend/middlewares"
)

func main() {
	// Connect to MongoDB
	database.ConnectDB()

	// Initialize cart collection
	handlers.InitCartCollection(database.DB)

	// Create router
	r := mux.NewRouter()

	// API subrouter
	api := r.PathPrefix("/api").Subrouter()

	// ============ PUBLIC ROUTES (NO AUTH) ============

	// Auth
	api.HandleFunc("/register", handlers.RegisterHandler).Methods("POST", "OPTIONS")
	api.HandleFunc("/login", handlers.LoginHandler).Methods("POST", "OPTIONS")

	// Products (Public)
	api.HandleFunc("/products", handlers.GetProducts).Methods("GET", "OPTIONS")
	api.HandleFunc("/products/{id}/related", handlers.GetRelatedProducts).Methods("GET", "OPTIONS")
	api.HandleFunc("/products/slug/{slug}", handlers.GetProductBySlug).Methods("GET", "OPTIONS")
	api.HandleFunc("/products/{id}", handlers.GetProductByID).Methods("GET", "OPTIONS")

	// ============ CART ROUTES (Optional Auth) ============
	api.HandleFunc("/cart", middlewares.OptionalAuthMiddleware(handlers.GetCart)).Methods("GET", "OPTIONS")
	api.HandleFunc("/cart", middlewares.OptionalAuthMiddleware(handlers.AddToCart)).Methods("POST", "OPTIONS")
	api.HandleFunc("/cart/update", middlewares.OptionalAuthMiddleware(handlers.UpdateCartItem)).Methods("PUT", "OPTIONS")
	api.HandleFunc("/cart/remove", middlewares.OptionalAuthMiddleware(handlers.RemoveItem)).Methods("DELETE", "OPTIONS")
	api.HandleFunc("/cart/clear", middlewares.OptionalAuthMiddleware(handlers.ClearCart)).Methods("DELETE", "OPTIONS")

	// ============ ORDER ROUTES (Optional Auth) ============
	api.HandleFunc("/orders", middlewares.OptionalAuthMiddleware(handlers.GetOrders)).Methods("GET", "OPTIONS")
	api.HandleFunc("/orders/{id}", middlewares.OptionalAuthMiddleware(handlers.GetOrderByID)).Methods("GET", "OPTIONS")
	api.HandleFunc("/orders", middlewares.OptionalAuthMiddleware(handlers.CreateOrder)).Methods("POST", "OPTIONS")
	api.HandleFunc("/orders/{id}/cancel", middlewares.OptionalAuthMiddleware(handlers.CancelOrder)).Methods("PUT", "OPTIONS") // ✅ Thêm dòng này
	api.HandleFunc("/orders/{id}", middlewares.VerifyJWT(handlers.UpdateOrderStatus)).Methods("PUT", "OPTIONS")
	api.HandleFunc("/orders/{id}", middlewares.VerifyJWT(handlers.DeleteOrder)).Methods("DELETE", "OPTIONS")

	// ============ PROTECTED ROUTES (WITH AUTH) ============

	// Products (Admin only)
	api.HandleFunc("/admin/products", middlewares.VerifyJWT(handlers.CreateProduct)).Methods("POST", "OPTIONS")
	api.HandleFunc("/admin/products/{id}", middlewares.VerifyJWT(handlers.UpdateProduct)).Methods("PUT", "OPTIONS")
	api.HandleFunc("/admin/products/{id}", middlewares.VerifyJWT(handlers.DeleteProduct)).Methods("DELETE", "OPTIONS")

	// ============ ADMIN ROUTES (Protected) ============
	api.HandleFunc("/admin/stats", middlewares.VerifyJWT(handlers.GetDashboardStats)).Methods("GET", "OPTIONS")
	api.HandleFunc("/admin/users", middlewares.VerifyJWT(handlers.GetUsersWithStats)).Methods("GET", "OPTIONS")
	api.HandleFunc("/admin/orders/recent", middlewares.VerifyJWT(handlers.GetRecentOrders)).Methods("GET", "OPTIONS")
	api.HandleFunc("/admin/orders", middlewares.VerifyJWT(handlers.GetAllOrders)).Methods("GET", "OPTIONS")
	api.HandleFunc("/admin/products/top", middlewares.VerifyJWT(handlers.GetTopProducts)).Methods("GET", "OPTIONS")

	// Profile
	api.HandleFunc("/profile", middlewares.VerifyJWT(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message": "Welcome to your profile"}`))
	})).Methods("GET", "OPTIONS")

	// ============ CORS CONFIGURATION ============

	c := cors.New(cors.Options{
		AllowedOrigins: []string{
			"http://localhost:3000",
			"http://localhost:8080",
			"http://localhost:5173",
			"http://127.0.0.1:3000",
			"http://127.0.0.1:8080",
			"http://127.0.0.1:5173",
		},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"},
		AllowCredentials: false,
		Debug:            true,
	})

	handler := c.Handler(r)

	// ============ START SERVER ============

	port := os.Getenv("PORT")
	if port == "" {
		port = "10000"
	}

	line := strings.Repeat("=", 60)
	log.Println(line)
	log.Println("🚀 GoSporty Backend Server")
	log.Println(line)
	log.Printf("📡 Server running on: http://localhost:%s\n", port)
	log.Println("")
	log.Println("🌐 Public Endpoints:")
	log.Println("   - POST   /api/register")
	log.Println("   - POST   /api/login")
	log.Println("   - GET    /api/products")
	log.Println("   - GET    /api/products/{id}")
	log.Println("   - GET    /api/products/slug/{slug}")
	log.Println("")
	log.Println("🛒 Cart Endpoints:")
	log.Println("   - GET    /api/cart")
	log.Println("   - POST   /api/cart")
	log.Println("   - PUT    /api/cart/update")
	log.Println("   - DELETE /api/cart/remove")
	log.Println("   - DELETE /api/cart/clear")
	log.Println("")
	log.Println("📦 Order Endpoints:")
	log.Println("   - GET    /api/orders")
	log.Println("   - GET    /api/orders/{id}")
	log.Println("   - POST   /api/orders")
	log.Println("   - PUT    /api/orders/{id} (Auth)")
	log.Println("   - DELETE /api/orders/{id} (Auth)")
	log.Println("")
	log.Println("🔒 Protected Endpoints (Auth Required):")
	log.Println("   - POST   /api/admin/products")
	log.Println("   - PUT    /api/admin/products/{id}")
	log.Println("   - DELETE /api/admin/products/{id}")
	log.Println("   - GET    /api/admin/stats")
	log.Println("   - GET    /api/admin/users")
	log.Println("   - GET    /api/admin/orders")
	log.Println("   - GET    /api/admin/orders/recent")
	log.Println("   - GET    /api/profile")
	log.Println(line)
	log.Println("✅ Server started successfully!")
	log.Println("")

	log.Fatal(http.ListenAndServe(":"+port, handler))
}
