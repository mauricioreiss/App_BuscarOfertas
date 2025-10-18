import sys
import os
import google.generativeai as genai
from fastapi import APIRouter
from pydantic import BaseModel
# Importamos a PlainTextResponse para devolver texto simples
from fastapi.responses import PlainTextResponse

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# --- CONFIGURAÇÃO ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
# --------------------

router = APIRouter(
    prefix="/ai",
    tags=["IA"],
)

class MarketQuery(BaseModel):
    market_name: str
    bairro: str
    cidade: str

@router.post("/fetch-offers-text")
async def fetch_offers_as_text(query: MarketQuery):
    """
    Este endpoint recebe os dados do mercado, pergunta à IA pelas ofertas
    e retorna a resposta da IA como TEXTO BRUTO.
    """
    if not GEMINI_API_KEY:
        return PlainTextResponse("Chave da API do Gemini não configurada.", status_code=500)

    prompt = f"traga-me uma lista em texto contendo algumas ofertas de produtos do supermercado {query.market_name} do bairro {query.bairro} da cidade de {query.cidade}, monte uma lista com as 10 primeiras ofertas que aparecer e me retorne apenas a lista sem nenhum texto a mais como resposta"
    
    print(f"Enviando prompt de busca para a IA: '{prompt}'")
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        print(f"IA retornou o texto bruto das ofertas.")
        
        # Retornamos a resposta da IA diretamente como texto simples
        return PlainTextResponse(content=response.text)

    except Exception as e:
        print(f"ERRO ao comunicar com a IA: {e}")
        return PlainTextResponse(f"Erro ao comunicar com a IA: {e}", status_code=500)

