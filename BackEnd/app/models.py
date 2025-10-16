from sqlalchemy import Column, Integer, String,Float,ForeignKey
from sqlalchemy.orm import relationship
from .dataBase import Base


class Market(Base):
    __tablename__ = "markets"
    id = Column(Integer, primary_key=True, index=True)
    google_place_id = Column(String, unique=True, index=True,nullable=False)
    name = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)

    offers = relationship("Offer", back_populates="owner")

class Offer(Base):
    __tablename__ = "offers"
    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String, index=True)
    price = Column(String)

    market_id = Column(Integer, ForeignKey("markets.id"))

    owner = relationship("Market", back_populates="offers")