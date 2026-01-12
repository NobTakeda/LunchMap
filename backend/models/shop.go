package models

type Shop struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	Address   string  `json:"address"`
	Phone     string  `json:"phone"`
	URL       string  `json:"url"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}
