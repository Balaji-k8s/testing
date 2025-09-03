from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from .models import PriorityEnum, StatusEnum


class Attachment(BaseModel):
	id: int
	filename: str
	content_type: Optional[str] = None
	size_bytes: Optional[int] = None
	path: str
	created_at: datetime

	class Config:
		from_attributes = True


class Comment(BaseModel):
	id: int
	author: str
	content: str
	created_at: datetime

	class Config:
		from_attributes = True


class TicketBase(BaseModel):
	title: str = Field(..., max_length=255)
	description: str
	priority: PriorityEnum = PriorityEnum.medium
	assignee: str = Field(..., max_length=120)
	category: Optional[str] = Field(default="other", max_length=80)
	status: StatusEnum = StatusEnum.open


class TicketCreate(TicketBase):
	pass


class TicketUpdate(BaseModel):
	title: Optional[str] = None
	description: Optional[str] = None
	priority: Optional[PriorityEnum] = None
	assignee: Optional[str] = None
	category: Optional[str] = None
	status: Optional[StatusEnum] = None


class Ticket(TicketBase):
	id: int
	created_at: datetime
	updated_at: datetime
	resolved_at: Optional[datetime] = None
	attachments: List[Attachment] = []
	comments: List[Comment] = []

	class Config:
		from_attributes = True


class KPIReport(BaseModel):
	total_tickets: int
	recent_30d: int
	avg_resolution_days: int
	priority_counts: dict
	category_counts: dict
	assignee_workload: dict


