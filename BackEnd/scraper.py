import sys
import os
import google.generativeai as genai

# Adiciona o diretório pai ao caminho de busca do Python (boa prática)
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# --- CONFIGURAÇÃO ---
# O script lê a sua chave da API a partir do ambiente do seu sistema
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# --------------------

def test_gemini_prompt():
    """
    Função de teste que envia um único prompt para a API do Gemini e imprime a resposta bruta.
    """
    if not GEMINI_API_KEY:
        print("ERRO CRÍTICO: A variável de ambiente 'GEMINI_API_KEY' não está definida.")
        print("Por favor, defina-a no seu terminal antes de executar o script.")
        return

    try:
        # Configura a API do Gemini com a sua chave
        genai.configure(api_key=GEMINI_API_KEY)

        # O seu prompt de teste exato
        prompt = "traga-me uma lista em texto contendo algumas ofertas de produtos do supermercado goodbom do bairro matão da cidade de sumaré, monte uma lista com as 10 primeiras ofertas que aparecer e me retorne apenas a lista sem nenhum texto a mais como resposta"
        
        print(f"A enviar o seguinte prompt para a IA:\n'{prompt}'")
        
        # Usamos o nome do modelo mais recente e poderoso
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Geramos o conteúdo
        response = model.generate_content(prompt)
        
        # --- O PASSO MAIS IMPORTANTE ---
        # Imprimimos a resposta de texto EXATAMENTE como ela veio da IA, sem tentar processá-la.
        print("\n--- RESPOSTA BRUTA DA IA ---")
        print(response.text)
        print("--- FIM DA RESPOSTA ---")

    except Exception as e:
        # Se ocorrer qualquer erro durante a chamada à API, ele será mostrado aqui
        print(f"\n!!! OCORREU UM ERRO AO COMUNICAR COM A IA !!!")
        print(e)

# Este bloco garante que o código só é executado quando o ficheiro é chamado diretamente
if __name__ == "__main__":
    test_gemini_prompt()
