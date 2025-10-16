from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..dataBase import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter(
    prefix="/offers",
    tags=["Offers"],
)

@router.get("/{google_place_id}", response_model=List[schemas.Offer])
def read_market_offers(google_place_id: str, db: Session = Depends(get_db)):
    offers = crud.get_offers_by_place_id(db, google_place_id=google_place_id)
    return offers