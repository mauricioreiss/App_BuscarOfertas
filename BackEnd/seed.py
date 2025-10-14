from app.dataBase import SessionLocal,engine
from app import models

db = SessionLocal()

models.Base.metadata.create_all(bind=engine)


if not db.query(models.Market).first():
    print ("Base de dados vazia, inserindo dados iniciais...") 

    market1 = models.Market(name="Mercado 1", latitude=-23.55052, longitude=-46.633308)
    market2 = models.Market(name="Mercado 2", latitude=-22.906847, longitude=-43.172896)
    market3 = models.Market(name="Mercado 3", latitude=-15.794229, longitude=-47.882166)

    db.add_all([market1, market2, market3])
    db.commit()

    offer1 = models.Offer(product_name="Oferta 1", price="10.00", owner=market1)
    offer2 = models.Offer(product_name="Oferta 2", price="20.00", owner=market2)
    offer3 = models.Offer(product_name="Oferta 3", price="30.00", owner=market3)

    db.add_all([offer1, offer2, offer3])
    db.commit()

    print ("Dados iniciais inseridos com sucesso.")
else:
    print ("Base de dados já contém dados, nenhuma ação tomada.")

    db.close()