from fastapi import APIRouter,HTTPException,Depends
from typing import List
from sqlalchemy.orm import Session
from .. import schemas, crud, models
from ..dataBase import SessionLocal,engine

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter(prefix="/markets", tags=["Markets"])


@router.get("/", response_model=List[schemas.Market])
def read_markets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    markets = crud.get_markets(db, skip=skip, limit=limit)
    return markets

@router.get("/{market_id}/offers", response_model=List[schemas.Offer])
def read_market_offers(market_id: int, db: Session = Depends(get_db)):
    offers = crud.get_market_offers(db, market_id=market_id)
    if not offers:
        db_market = crud.get_market(db, market_id=market_id)
        if db_market is None:
            raise HTTPException(status_code=404, detail="Market not found")
    return offers