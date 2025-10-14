from sqlalchemy import Column, Integer, String,Float,ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Market(Base):
    __tablename__ = "markets"
    id = Column(Integer, primary_key=True, index=True)
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