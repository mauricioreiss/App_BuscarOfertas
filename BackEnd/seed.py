import sys
import os
import requests
import time
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.dataBase import SessionLocal, engine
from app import models

LATITUDE = -22.8219
LONGITUDE = -47.2669
RAIO_EM_METROS = 3000 
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

def criar_tabelas():
    print("A verificar e criar tabelas...")
    models.Base.metadata.create_all(bind=engine)

def buscar_supermercados_osm(lat: float, lon: float, radius: int, tentativas=3) -> list:
    overpass_query = f"""
    [out:json][timeout:60];
    (
      node["shop"="supermarket"](around:{radius},{lat},{lon});
      way["shop"="supermarket"](around:{radius},{lat},{lon});
      relation["shop"="supermarket"](around:{radius},{lat},{lon});
    );
    out center;
    """
    
    for tentativa in range(tentativas):
        print(f"A contactar a API do OpenStreetMap... (Tentativa {tentativa + 1}/{tentativas})")
        try:
            # AUMENTÁMOS O TIMEOUT PARA 60 SEGUNDOS
            response = requests.post(OVERPASS_URL, data=overpass_query, timeout=60)
            response.raise_for_status()
            data = response.json()
            print(f"Sucesso! Encontrados {len(data.get('elements', []))} resultados.")
            return data.get('elements', [])
        except requests.exceptions.Timeout:
            print(f"ERRO: A API demorou demasiado tempo a responder (Timeout). A tentar novamente em 5 segundos...")
            time.sleep(5)
        except requests.exceptions.RequestException as e:
            print(f"ERRO: Falha ao contactar a API: {e}. A tentar novamente em 5 segundos...")
            time.sleep(5)
            
    print("ERRO: Todas as tentativas de contactar a API falharam.")
    return []

def popular_base_dados(db: Session, mercados_osm: list):
    print("A adicionar novos mercados à base de dados...")
    novos_mercados_adicionados = 0
    for mercado_data in mercados_osm:
        osm_id = str(mercado_data.get('id'))
        
        mercado_existente = db.query(models.Market).filter(models.Market.google_place_id == osm_id).first()
        
        if not mercado_existente and 'tags' in mercado_data and 'name' in mercado_data['tags']:
            nome_mercado = mercado_data['tags']['name']
            lat, lon = None, None
            
            if mercado_data.get('type') == 'node':
                lat, lon = mercado_data.get('lat'), mercado_data.get('lon')
            elif 'center' in mercado_data:
                lat, lon = mercado_data['center'].get('lat'), mercado_data['center'].get('lon')

            if nome_mercado and lat is not None and lon is not None:
                novo_mercado = models.Market(
                    google_place_id=osm_id,
                    name=nome_mercado,
                    latitude=lat,
                    longitude=lon
                )
                db.add(novo_mercado)
                novos_mercados_adicionados += 1
                print(f"  -> Adicionando: {nome_mercado}")

    if novos_mercados_adicionados > 0:
        db.commit()
        print(f"\nConcluído! {novos_mercados_adicionados} novos mercados guardados.")
    else:
        print("\nConcluído! Nenhum mercado novo para adicionar.")

def main():
    criar_tabelas()
    db_session = SessionLocal()
    try:
        mercados_encontrados = buscar_supermercados_osm(LATITUDE, LONGITUDE, RAIO_EM_METROS)
        if mercados_encontrados:
            popular_base_dados(db_session, mercados_encontrados)
    finally:
        db_session.close()
        print("Ligação à base de dados fechada.")

if __name__ == "__main__":
    main()
