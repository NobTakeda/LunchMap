package handlers

import (
	"lunchmap/models"
	"lunchmap/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ReviewHandler struct {
	sheetsService *services.SheetsService
}

func NewReviewHandler(sheetsService *services.SheetsService) *ReviewHandler {
	return &ReviewHandler{sheetsService: sheetsService}
}

func (h *ReviewHandler) GetReviews(c *gin.Context) {
	shopID := c.Param("id")

	reviews, err := h.sheetsService.GetReviewsByShopID(shopID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, reviews)
}

func (h *ReviewHandler) CreateReview(c *gin.Context) {
	shopID := c.Param("id")

	var input models.ReviewInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	review, err := h.sheetsService.CreateReview(shopID, &input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, review)
}
