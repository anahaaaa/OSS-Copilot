from sqlalchemy import create_engine
from dotenv import load_dotenv
from typing import Generator
from sqlalchemy.orm import Session, sessionmaker, DeclarativeBase
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db() -> Generator:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

class Base(DeclarativeBase):
    pass