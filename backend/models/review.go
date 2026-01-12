package models

import "time"

type Review struct {
	ID               string    `json:"id"`
	ShopID           string    `json:"shopId"`
	Reviewer         string    `json:"reviewer"`
	VisitCount       int       `json:"visitCount"`
	PriceRating      int       `json:"priceRating"`
	TasteRating      int       `json:"tasteRating"`
	AtmosphereRating int       `json:"atmosphereRating"`
	Comment          string    `json:"comment"`
	CreatedAt        time.Time `json:"createdAt"`
}

type ReviewInput struct {
	Reviewer         string `json:"reviewer" binding:"required"`
	VisitCount       int    `json:"visitCount" binding:"required,min=1"`
	PriceRating      int    `json:"priceRating" binding:"required,min=1,max=5"`
	TasteRating      int    `json:"tasteRating" binding:"required,min=1,max=5"`
	AtmosphereRating int    `json:"atmosphereRating" binding:"required,min=1,max=5"`
	Comment          string `json:"comment"`
}
