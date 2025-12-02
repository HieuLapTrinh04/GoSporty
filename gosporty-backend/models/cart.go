package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CartItem struct {
	ProductID primitive.ObjectID `bson:"productId" json:"productId"`
	Qty       int                `bson:"qty" json:"qty"`
	SelectedColor string         `bson:"selectedColor,omitempty" json:"selectedColor,omitempty"`
	SelectedSize  string         `bson:"selectedSize,omitempty" json:"selectedSize,omitempty"`
	Price     int                `bson:"price,omitempty" json:"price,omitempty"` // optional snapshot
	Name      string             `bson:"name,omitempty" json:"name,omitempty"`
	Image     string             `bson:"image,omitempty" json:"image,omitempty"`
}

type Cart struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	UserID    primitive.ObjectID `bson:"userId" json:"userId"`
	Items     []CartItem         `bson:"items" json:"items"`
	UpdatedAt primitive.DateTime `bson:"updatedAt" json:"updatedAt"`
}
