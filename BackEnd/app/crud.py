from sqlalchemy.orm import Session
from . import models, schemas   

def get_market(db: Session, market_id: int):
    return db.query(models.Market).filter(models.Market.id == market_id).first()

def get_markets(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Market).offset(skip).limit(limit).all()

def get_market_offers(db: Session, market_id: int):
    market = get_market(db, market_id=market_id)
    if market:
        return market.offers
    return []