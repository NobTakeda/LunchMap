package services

import (
	"context"
	"fmt"
	"lunchmap/models"
	"strconv"
	"time"

	"github.com/google/uuid"
	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

type SheetsService struct {
	service       *sheets.Service
	spreadsheetID string
}

func NewSheetsService(credentialsFile, spreadsheetID string) (*SheetsService, error) {
	ctx := context.Background()
	srv, err := sheets.NewService(ctx, option.WithCredentialsFile(credentialsFile))
	if err != nil {
		return nil, fmt.Errorf("unable to create sheets service: %v", err)
	}

	return &SheetsService{
		service:       srv,
		spreadsheetID: spreadsheetID,
	}, nil
}

func (s *SheetsService) GetShops() ([]models.Shop, error) {
	resp, err := s.service.Spreadsheets.Values.Get(s.spreadsheetID, "shops!A2:G").Do()
	if err != nil {
		return nil, fmt.Errorf("unable to retrieve shops: %v", err)
	}

	var shops []models.Shop
	for _, row := range resp.Values {
		if len(row) < 7 {
			continue
		}

		lat, _ := strconv.ParseFloat(fmt.Sprint(row[5]), 64)
		lng, _ := strconv.ParseFloat(fmt.Sprint(row[6]), 64)

		shops = append(shops, models.Shop{
			ID:        fmt.Sprint(row[0]),
			Name:      fmt.Sprint(row[1]),
			Address:   fmt.Sprint(row[2]),
			Phone:     fmt.Sprint(row[3]),
			URL:       fmt.Sprint(row[4]),
			Latitude:  lat,
			Longitude: lng,
		})
	}

	return shops, nil
}

func (s *SheetsService) GetShopByID(id string) (*models.Shop, error) {
	shops, err := s.GetShops()
	if err != nil {
		return nil, err
	}

	for _, shop := range shops {
		if shop.ID == id {
			return &shop, nil
		}
	}

	return nil, fmt.Errorf("shop not found: %s", id)
}

func (s *SheetsService) CreateShop(shop *models.Shop) error {
	shop.ID = uuid.New().String()

	values := [][]interface{}{
		{shop.ID, shop.Name, shop.Address, shop.Phone, shop.URL, shop.Latitude, shop.Longitude},
	}

	_, err := s.service.Spreadsheets.Values.Append(
		s.spreadsheetID,
		"shops!A:G",
		&sheets.ValueRange{Values: values},
	).ValueInputOption("RAW").Do()

	if err != nil {
		return fmt.Errorf("unable to create shop: %v", err)
	}

	return nil
}

func (s *SheetsService) GetReviewsByShopID(shopID string) ([]models.Review, error) {
	resp, err := s.service.Spreadsheets.Values.Get(s.spreadsheetID, "reviews!A2:I").Do()
	if err != nil {
		return nil, fmt.Errorf("unable to retrieve reviews: %v", err)
	}

	var reviews []models.Review
	for _, row := range resp.Values {
		if len(row) < 9 {
			continue
		}

		if fmt.Sprint(row[1]) != shopID {
			continue
		}

		visitCount, _ := strconv.Atoi(fmt.Sprint(row[3]))
		price, _ := strconv.Atoi(fmt.Sprint(row[4]))
		taste, _ := strconv.Atoi(fmt.Sprint(row[5]))
		atmosphere, _ := strconv.Atoi(fmt.Sprint(row[6]))
		createdAt, _ := time.Parse(time.RFC3339, fmt.Sprint(row[8]))

		reviews = append(reviews, models.Review{
			ID:               fmt.Sprint(row[0]),
			ShopID:           fmt.Sprint(row[1]),
			Reviewer:         fmt.Sprint(row[2]),
			VisitCount:       visitCount,
			PriceRating:      price,
			TasteRating:      taste,
			AtmosphereRating: atmosphere,
			Comment:          fmt.Sprint(row[7]),
			CreatedAt:        createdAt,
		})
	}

	return reviews, nil
}

func (s *SheetsService) CreateReview(shopID string, input *models.ReviewInput) (*models.Review, error) {
	review := &models.Review{
		ID:               uuid.New().String(),
		ShopID:           shopID,
		Reviewer:         input.Reviewer,
		VisitCount:       input.VisitCount,
		PriceRating:      input.PriceRating,
		TasteRating:      input.TasteRating,
		AtmosphereRating: input.AtmosphereRating,
		Comment:          input.Comment,
		CreatedAt:        time.Now(),
	}

	values := [][]interface{}{
		{
			review.ID,
			review.ShopID,
			review.Reviewer,
			review.VisitCount,
			review.PriceRating,
			review.TasteRating,
			review.AtmosphereRating,
			review.Comment,
			review.CreatedAt.Format(time.RFC3339),
		},
	}

	_, err := s.service.Spreadsheets.Values.Append(
		s.spreadsheetID,
		"reviews!A:I",
		&sheets.ValueRange{Values: values},
	).ValueInputOption("RAW").Do()

	if err != nil {
		return nil, fmt.Errorf("unable to create review: %v", err)
	}

	return review, nil
}
