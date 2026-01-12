export interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
  url: string;
  latitude: number;
  longitude: number;
}

export interface Review {
  id: string;
  shopId: string;
  reviewer: string;
  visitCount: number;
  priceRating: number;
  tasteRating: number;
  atmosphereRating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewInput {
  reviewer: string;
  visitCount: number;
  priceRating: number;
  tasteRating: number;
  atmosphereRating: number;
  comment: string;
}
