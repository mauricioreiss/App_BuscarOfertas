export type OfferType = {
  id: number;
  product_name: string;
  price: string;
  market_id: number;
};

export type MarketType = {
  id: number;
  name: string;
  bairro?: string;
  cidade?: string;
  offersText?: string; // Texto bruto das ofertas gerado pela IA
  latitude: number;
  longitude: number;
  offers: OfferType[];
};
