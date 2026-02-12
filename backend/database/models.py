from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    repositories = relationship(
        "Repository",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class Repository(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    repo_url = Column(String, nullable=False)
    repo_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="repositories")
    files = relationship(
        "CodeFile",
        back_populates="repository",
        cascade="all, delete-orphan",
    )


class CodeFile(Base):
    __tablename__ = "code_files"

    id = Column(Integer, primary_key=True, index=True)
    repo_id = Column(Integer, ForeignKey("repositories.id"), nullable=False, index=True)
    file_path = Column(String, nullable=False)
    language = Column(String, nullable=True)
    raw_content = Column(Text, nullable=False)

    repository = relationship("Repository", back_populates="files")
    chunks = relationship(
        "CodeChunk",
        back_populates="file",
        cascade="all, delete-orphan",
    )


class CodeChunk(Base):
    __tablename__ = "code_chunks"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("code_files.id"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    chunk_content = Column(Text, nullable=False)
    token_count = Column(Integer, nullable=False)

    file = relationship("CodeFile", back_populates="chunks")
