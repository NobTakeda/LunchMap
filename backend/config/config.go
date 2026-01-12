package config

import "os"

type Config struct {
	Port                  string
	GoogleSheetsID        string
	GoogleCredentialsFile string
}

func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return &Config{
		Port:                  port,
		GoogleSheetsID:        os.Getenv("GOOGLE_SHEETS_ID"),
		GoogleCredentialsFile: os.Getenv("GOOGLE_CREDENTIALS_FILE"),
	}
}
