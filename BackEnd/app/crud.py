from sqlalchemy.orm import Session
from . import models

def get_offers_by_place_id(db: Session, google_place_id: str):
    market = db.query(models.Market).filter(models.Market.google_place_id == google_place_id).first()
    
    if market:
        return market.offers
    
    return []