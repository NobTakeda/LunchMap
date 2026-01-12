import { Shop, Review, ReviewInput } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function getShops(): Promise<Shop[]> {
  const response = await fetch(`${API_URL}/api/shops`);
  if (!response.ok) {
    throw new Error('Failed to fetch shops');
  }
  return response.json();
}

export async function getShop(id: string): Promise<Shop> {
  const response = await fetch(`${API_URL}/api/shops/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch shop');
  }
  return response.json();
}

export async function getReviews(shopId: string): Promise<Review[]> {
  const response = await fetch(`${API_URL}/api/shops/${shopId}/reviews`);
  if (!response.ok) {
    throw new Error('Failed to fetch reviews');
  }
  return response.json();
}

export async function createReview(shopId: string, review: ReviewInput): Promise<Review> {
  const response = await fetch(`${API_URL}/api/shops/${shopId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(review),
  });
  if (!response.ok) {
    throw new Error('Failed to create review');
  }
  return response.json();
}

export interface ShopInput {
  name: string;
  address: string;
  phone: string;
  url: string;
  latitude: number;
  longitude: number;
}

export async function createShop(shop: ShopInput): Promise<Shop> {
  const response = await fetch(`${API_URL}/api/shops`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(shop),
  });
  if (!response.ok) {
    throw new Error('Failed to create shop');
  }
  return response.json();
}
