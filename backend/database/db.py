from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False)


def init_db(database_url: str) -> None:
    """Initialize the database engine and create tables."""

    connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
    engine = create_engine(database_url, connect_args=connect_args)
    SessionLocal.configure(bind=engine)
    Base.metadata.create_all(bind=engine)


def get_db():
    """Yield a database session."""

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
