package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Product struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Name          string             `bson:"name" json:"name"`
	Description   string             `bson:"description" json:"description"`
	Price         int64              `bson:"price" json:"price"`
	OriginalPrice int64              `bson:"originalPrice,omitempty" json:"originalPrice,omitempty"`
	Discount      int                `bson:"discount,omitempty" json:"discount,omitempty"`
	Image         string             `bson:"image" json:"image"`
	Images        []string           `bson:"images,omitempty" json:"images,omitempty"`
	Category      string             `bson:"category" json:"category"`
	Subcategory   string             `bson:"subcategory" json:"subcategory"`
	Brand         string             `bson:"brand,omitempty" json:"brand,omitempty"`
	Slug          string             `bson:"slug" json:"slug"`
	Stock         int                `bson:"stock" json:"stock"`
	Colors        []string           `bson:"colors,omitempty" json:"colors,omitempty"`
	Sizes         []string           `bson:"sizes,omitempty" json:"sizes,omitempty"`
	Features      []string           `bson:"features,omitempty" json:"features,omitempty"`
	Rating        float64            `bson:"rating,omitempty" json:"rating,omitempty"`
	ReviewCount   int                `bson:"reviewCount,omitempty" json:"reviewCount,omitempty"`
	CreatedAt     primitive.DateTime `bson:"createdAt" json:"createdAt"`
	UpdatedAt     primitive.DateTime `bson:"updatedAt" json:"updatedAt"`
}

type ProductResponse struct {
	Products []Product `json:"products"`
	Page     int       `json:"page"`
	Pages    int       `json:"pages"`
	Total    int64     `json:"total"`
}
