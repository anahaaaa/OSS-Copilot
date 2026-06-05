from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()


client = OpenAI(
    api_key=os.getenv("API_KEY"),
    base_url=os.getenv("BASE_URL")
)

def embed_text(text: str) -> list[float]:

    response= client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding