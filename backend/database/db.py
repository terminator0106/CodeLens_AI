from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base

Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False)


def _ensure_user_profile_image_column(engine) -> None:
    """Ensure the users.profile_image_url column exists for existing SQLite DBs.

    When we added the profile_image_url field to the User model, existing SQLite
    databases created before that change do not automatically gain the new
    column. This helper performs a minimal, safe migration by adding the column
    if it's missing.
    """

    try:
        inspector = inspect(engine)
        if "users" not in inspector.get_table_names():
            return

        columns = [col["name"] for col in inspector.get_columns("users")]
        if "profile_image_url" in columns:
            return

        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN profile_image_url VARCHAR"))
            conn.commit()
    except Exception:
        # If anything goes wrong here, we don't want to block app startup;
        # the underlying error will surface on first query instead.
        return


def _ensure_user_username_column(engine) -> None:
    """Ensure the users.username column exists for existing SQLite DBs."""

    try:
        inspector = inspect(engine)
        if "users" not in inspector.get_table_names():
            return

        columns = [col["name"] for col in inspector.get_columns("users")]
        if "username" in columns:
            return

        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR"))
            conn.commit()
    except Exception:
        return


def init_db(database_url: str) -> None:
    """Initialize the database engine, apply lightweight migrations, and create tables."""

    connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
    engine = create_engine(database_url, connect_args=connect_args)

    # Apply a minimal migration for the new profile_image_url column when
    # using an existing SQLite database.
    if database_url.startswith("sqlite"):
        _ensure_user_profile_image_column(engine)
        _ensure_user_username_column(engine)

    SessionLocal.configure(bind=engine)
    Base.metadata.create_all(bind=engine)


def get_db():
    """Yield a database session."""

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
