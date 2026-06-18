from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    github_client_id: str
    github_client_secret: str
    database_url: str
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

settings = Settings()