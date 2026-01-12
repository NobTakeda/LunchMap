package handlers

import (
	"lunchmap/models"
	"lunchmap/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ShopHandler struct {
	sheetsService *services.SheetsService
}

func NewShopHandler(sheetsService *services.SheetsService) *ShopHandler {
	return &ShopHandler{sheetsService: sheetsService}
}

func (h *ShopHandler) GetShops(c *gin.Context) {
	shops, err := h.sheetsService.GetShops()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, shops)
}

func (h *ShopHandler) GetShop(c *gin.Context) {
	id := c.Param("id")

	shop, err := h.sheetsService.GetShopByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, shop)
}

func (h *ShopHandler) CreateShop(c *gin.Context) {
	var shop models.Shop
	if err := c.ShouldBindJSON(&shop); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.sheetsService.CreateShop(&shop); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, shop)
}
