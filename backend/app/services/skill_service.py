from openai import OpenAI
import os
import json
from dotenv import load_dotenv

client = OpenAI(
    api_key=os.getenv("API_KEY"),
    base_url=os.getenv("BASE_URL")
)

def extract_skills(repo_descriptions: list[str]):

    repos_text = "\n".join(repo_descriptions)

    prompt = f"""
    Analyze these GitHub repository descriptions.

    Return ONLY raw JSON.

    DO NOT wrap the response in markdown.
    DO NOT use ```json.
    DO NOT add explanations.

    Format:
    {{
    "skills": [],
    "domains": [],
    "experience_level": ""
    }}

    Repository Descriptions:
    {repos_text}
    """

    response = client.chat.completions.create(
        model="anthropic/claude-haiku-4.5",
        max_tokens=500,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        response_format={"type": "json_object"}
    )

    content = response.choices[0].message.content

    content = (
        content
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )

    return json.loads(content)