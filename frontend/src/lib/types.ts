export interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  location?: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  slug?: string;
  image?: string;
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface Product {
  _id: string;
  name: string;
  title?: string;
  description?: string;
  price: number;
  stock?: number;
  images?: string[];
  image?: string;
  category?: string | Category;
  rating?: number;
  variants?: ProductVariant[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
