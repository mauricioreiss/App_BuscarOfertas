export type OfferType = {
  id: number;
  product_name: string;
  price: string;
  market_id: number;
};

export type MarketType = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  offers: OfferType[];
};
