from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
import enum


class PriorityEnum(str, enum.Enum):
	low = "low"
	medium = "medium"
	high = "high"


class StatusEnum(str, enum.Enum):
	open = "open"
	in_progress = "in-progress"
	resolved = "resolved"
	closed = "closed"


class Ticket(Base):
	__tablename__ = "tickets"

	id = Column(Integer, primary_key=True, index=True)
	title = Column(String(255), nullable=False)
	description = Column(Text, nullable=False)
	priority = Column(Enum(PriorityEnum), nullable=False, default=PriorityEnum.medium)
	assignee = Column(String(120), nullable=False)
	category = Column(String(80), nullable=True, default="other")
	status = Column(Enum(StatusEnum), nullable=False, default=StatusEnum.open)
	created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.utcnow)
	resolved_at = Column(DateTime, nullable=True)

	attachments = relationship("Attachment", back_populates="ticket", cascade="all, delete-orphan")
	comments = relationship("Comment", back_populates="ticket", cascade="all, delete-orphan")


class Attachment(Base):
	__tablename__ = "attachments"

	id = Column(Integer, primary_key=True, index=True)
	ticket_id = Column(Integer, ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False, index=True)
	filename = Column(String(255), nullable=False)
	content_type = Column(String(255), nullable=True)
	size_bytes = Column(BigInteger, nullable=True)
	path = Column(String(512), nullable=False)
	created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

	ticket = relationship("Ticket", back_populates="attachments")


class Comment(Base):
	__tablename__ = "comments"

	id = Column(Integer, primary_key=True, index=True)
	ticket_id = Column(Integer, ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False, index=True)
	author = Column(String(120), nullable=False, default="User")
	content = Column(Text, nullable=False)
	created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

	ticket = relationship("Ticket", back_populates="comments")


