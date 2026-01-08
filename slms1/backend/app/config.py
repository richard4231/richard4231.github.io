"""Application configuration using Pydantic Settings."""

from functools import lru_cache
from typing import Literal

from pydantic import PostgresDsn, RedisDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Application
    app_name: str = "SLMS API"
    app_version: str = "0.1.0"
    environment: Literal["development", "staging", "production"] = "development"
    debug: bool = False
    secret_key: str = "change-me-in-production"

    # Database
    database_url: PostgresDsn = "postgresql+asyncpg://slms:slms@localhost:5432/slms"  # type: ignore
    database_pool_size: int = 5
    database_max_overflow: int = 10

    # Redis
    redis_url: RedisDsn = "redis://localhost:6379/0"  # type: ignore

    # CORS
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
    ]

    # SWITCH edu-ID (OIDC)
    eduid_client_id: str = ""
    eduid_client_secret: str = ""
    eduid_issuer: str = "https://login.eduid.ch"
    eduid_redirect_uri: str = "http://localhost:8000/api/v1/auth/callback"

    # JWT
    jwt_algorithm: str = "RS256"
    jwt_access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 7
    jwt_private_key: str = ""
    jwt_public_key: str = ""

    # Email (SMTP)
    smtp_host: str = "smtp.mailjet.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from_email: str = "noreply@slms.university.ch"
    smtp_from_name: str = "SLMS System"

    # S3 Storage (Exoscale)
    s3_endpoint: str = "https://sos-ch-gva-2.exo.io"
    s3_access_key: str = ""
    s3_secret_key: str = ""
    s3_bucket: str = "slms-documents"
    s3_region: str = "ch-gva-2"

    # Sentry
    sentry_dsn: str = ""

    # Rate Limiting
    rate_limit_default: str = "100/minute"
    rate_limit_auth: str = "10/minute"

    # Waitlist
    default_waitlist_threshold: int = 30

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
