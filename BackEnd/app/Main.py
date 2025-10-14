from fastapi import FastAPI
from .routers import markets
from . import models
from .dataBase import engine


models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(markets.router) 