import sys
import os
import requests
import pytesseract
import google.generativeai as genai
import json
import re
from PIL import Image
from io import BytesIO
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# --- CORREÇÃO DE CONTEXTO ---
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.dataBase import SessionLocal, engine
from app import models

# --- CONFIGURAÇÃO ---
NOME_DO_MERCADO_ALVO = "GoodBom Supermercados Sumaré"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# --------------------

# --- INICIALIZAÇÃO DA IA ---
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
# --------------------------

def find_offers_link_with_ai(market_name: str) -> str | None:
    print(f"A usar a IA para encontrar o link de ofertas para: '{market_name}'...")
    try:
        # --- CORREÇÃO FINAL: Usamos o nome do modelo mais compatível ---
        model = genai.GenerativeModel('gemini-1.0-pro')
        # -----------------------------------------------------------
        prompt = f"Qual é o URL exato da página de ofertas, promoções, tabloides ou jornal do '{market_name}'? Retorne apenas o URL e nada mais."
        response = model.generate_content(prompt)
        match = re.search(r'https?://[^\s]+', response.text)
        if match:
            offers_url = match.group(0)
            print(f"IA encontrou o link de ofertas: {offers_url}")
            return offers_url
        else:
            print("ERRO: A IA não conseguiu encontrar um URL válido na sua resposta.")
            return None
    except Exception as e:
        print(f"ERRO ao comunicar com a IA para encontrar o link: {e}")
        return None

def extract_text_from_leaflet_page(page_url: str) -> str | None:
    print(f"A processar a página do panfleto: {page_url}")
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(page_url, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        image_tag = soup.find('img')
        if not image_tag: return None
        absolute_image_url = urljoin(page_url, image_tag.get('src'))
        print(f"Link da imagem do panfleto: {absolute_image_url}")
        img_response = requests.get(absolute_image_url, headers=headers, timeout=15)
        img_response.raise_for_status()
        image = Image.open(BytesIO(img_response.content))
        text = pytesseract.image_to_string(image, lang='por')
        print("Extração de texto do panfleto concluída.")
        return text
    except Exception as e:
        print(f"ERRO ao processar a página do panfleto: {e}")
        return None

def structure_offers_with_ai(raw_text: str) -> list[dict] | None:
    if not raw_text or not raw_text.strip(): return None
    print("\nA enviar texto para a IA para estruturação...")
    prompt = f"""
    Analise o seguinte texto extraído de um panfleto de supermercado. Extraia todas as ofertas que conseguir identificar.
    Retorne o resultado como uma lista de objetos JSON, onde cada objeto tem EXATAMENTE as seguintes chaves: "product_name" e "price".
    - "product_name" deve ser o nome mais completo possível do produto.
    - "price" deve ser o preço numérico, usando ponto como separador decimal (ex: 4.99).
    - Ignore qualquer texto que não seja uma oferta clara. Se não encontrar nenhuma oferta, retorne uma lista vazia [].
    Texto para analisar:
    ---
    {raw_text}
    ---
    """
    try:
        # --- CORREÇÃO FINAL AQUI TAMBÉM ---
        model = genai.GenerativeModel('gemini-1.0-pro')
        # ----------------------------------
        response = model.generate_content(prompt)
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
        offers_list = json.loads(cleaned_response)
        print(f"Sucesso! IA estruturou {len(offers_list)} ofertas.")
        return offers_list
    except Exception as e:
        print(f"ERRO ao comunicar com a IA para estruturar as ofertas: {e}")
        return None

def main():
    if not GEMINI_API_KEY:
        print("ERRO CRÍTICO: A variável de ambiente 'GEMINI_API_KEY' não foi definida.")
        return

    offers_page_url = find_offers_link_with_ai(NOME_DO_MERCADO_ALVO)
    
    if offers_page_url:
        raw_text = extract_text_from_leaflet_page(offers_page_url)
        
        if raw_text:
            structured_offers = structure_offers_with_ai(raw_text)
            
            if structured_offers:
                print("\n--- OFERTAS ESTRUTURADAS PELA IA ---")
                for offer in structured_offers:
                    print(f"- Produto: {offer.get('product_name')}, Preço: {offer.get('price')}")
                print("-------------------------------------")
            else:
                print("\nA IA não conseguiu estruturar nenhuma oferta a partir do texto.")

if __name__ == "__main__":
    main()