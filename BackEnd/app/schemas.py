from pydantic import BaseModel
from typing import List, Optional

class OfferBase(BaseModel):
    product_name: str
    price: str

class Offer(OfferBase):
    id: int
    market_id: int
    
    class Config:
        orm_mode = True

class MarketBase(BaseModel):
    name : str
    latitude: float
    longitude: float

class Market(MarketBase):
    id: int
    offers: list[Offer] = []

    class Config:
        from_attributes = True
