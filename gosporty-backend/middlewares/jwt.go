// package middlewares

// import (
// 	"context"
// 	"net/http"
// 	"os"
// 	"strings"

// 	"github.com/golang-jwt/jwt/v4"
// )

// var jwtSecret = []byte(getSecret())

// func getSecret() string {
// 	secret := os.Getenv("JWT_SECRET")
// 	if secret == "" {
// 		secret = "SECRET_KEY" // fallback nếu chưa có .env
// 	}
// 	return secret
// }

// // ✅ Sửa signature: next là http.HandlerFunc, không phải http.Handler
// func VerifyJWT(next http.HandlerFunc) http.HandlerFunc {
// 	return func(w http.ResponseWriter, r *http.Request) {
// 		// Cho phép OPTIONS để tránh lỗi CORS với browser
// 		if r.Method == http.MethodOptions {
// 			w.WriteHeader(http.StatusOK)
// 			return
// 		}

// 		authHeader := r.Header.Get("Authorization")
// 		if authHeader == "" {
// 			w.WriteHeader(http.StatusUnauthorized)
// 			w.Write([]byte(`{"error": "Missing Authorization header"}`))
// 			return
// 		}

// 		// Format phải đúng: "Bearer token"
// 		parts := strings.Split(authHeader, " ")
// 		if len(parts) != 2 || parts[0] != "Bearer" {
// 			w.WriteHeader(http.StatusUnauthorized)
// 			w.Write([]byte(`{"error": "Invalid Authorization format"}`))
// 			return
// 		}

// 		tokenString := parts[1]

// 		claims := &jwt.RegisteredClaims{}
// 		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
// 			return jwtSecret, nil
// 		})

// 		if err != nil || !token.Valid {
// 			w.WriteHeader(http.StatusUnauthorized)
// 			w.Write([]byte(`{"error": "Invalid token"}`))
// 			return
// 		}

//			// Lấy userId từ claims.Subject
//			ctx := context.WithValue(r.Context(), "userId", claims.Subject)
//			next(w, r.WithContext(ctx))
//		}
//	}
package middlewares

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v4"
)

var jwtSecret = []byte(getSecret())

func getSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "SECRET_KEY" // fallback
	}
	return secret
}

// Claims struct
type Claims struct {
	UserID string `json:"userId"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

// VerifyJWT - Middleware xác thực JWT token
func VerifyJWT(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Cho phép OPTIONS request
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"error": "Missing Authorization header"}`))
			return
		}

		// Format: "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"error": "Invalid Authorization format"}`))
			return
		}

		tokenString := parts[1]

		// Parse token
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"error": "Invalid or expired token"}`))
			return
		}

		// Lưu userId vào context
		ctx := context.WithValue(r.Context(), "userId", claims.UserID)
		ctx = context.WithValue(ctx, "email", claims.Email)

		// Continue với request có userId trong context
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

// OptionalAuthMiddleware - Middleware không bắt buộc auth
// Nếu có token hợp lệ thì set vào context, không thì bỏ qua
func OptionalAuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				tokenString := parts[1]

				claims := &Claims{}
				token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
					return jwtSecret, nil
				})

				if err == nil && token.Valid {
					ctx := context.WithValue(r.Context(), "userId", claims.UserID)
					ctx = context.WithValue(ctx, "email", claims.Email)
					r = r.WithContext(ctx)
				}
			}
		}

		next.ServeHTTP(w, r)
	}
}
