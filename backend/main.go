package main

import (
	"log"
	"lunchmap/config"
	"lunchmap/handlers"
	"lunchmap/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	sheetsService, err := services.NewSheetsService(cfg.GoogleCredentialsFile, cfg.GoogleSheetsID)
	if err != nil {
		log.Fatalf("Failed to initialize sheets service: %v", err)
	}

	shopHandler := handlers.NewShopHandler(sheetsService)
	reviewHandler := handlers.NewReviewHandler(sheetsService)

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	{
		api.GET("/shops", shopHandler.GetShops)
		api.GET("/shops/:id", shopHandler.GetShop)
		api.POST("/shops", shopHandler.CreateShop)
		api.GET("/shops/:id/reviews", reviewHandler.GetReviews)
		api.POST("/shops/:id/reviews", reviewHandler.CreateReview)
	}

	log.Printf("Server starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
