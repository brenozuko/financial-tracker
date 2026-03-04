from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://user:password@localhost:5432/financial_tracker"

    # JWT
    secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_days: int = 30

    # Frontend URL (used in password reset emails)
    frontend_url: str = "http://localhost:5173"

    @property
    def sqlalchemy_database_uri(self) -> str:
        return self.database_url


settings = Settings()
