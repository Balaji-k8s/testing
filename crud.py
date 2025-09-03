from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Optional, List

from . import models, schemas


def create_ticket(db: Session, ticket_in: schemas.TicketCreate) -> models.Ticket:
	ticket = models.Ticket(
		title=ticket_in.title,
		description=ticket_in.description,
		priority=ticket_in.priority,
		assignee=ticket_in.assignee,
		category=ticket_in.category or "other",
		status=ticket_in.status or models.StatusEnum.open,
	)
	db.add(ticket)
	db.commit()
	db.refresh(ticket)
	return ticket


def get_ticket(db: Session, ticket_id: int) -> Optional[models.Ticket]:
	return db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()


def list_tickets(
	db: Session,
	*,
	status: Optional[models.StatusEnum] = None,
	priority: Optional[models.PriorityEnum] = None,
	assignee: Optional[str] = None,
	created_from: Optional[datetime] = None,
	created_to: Optional[datetime] = None,
	sort_by: str = "created_at",
	order: str = "desc",
) -> List[models.Ticket]:
	q = db.query(models.Ticket)
	if status:
		q = q.filter(models.Ticket.status == status)
	if priority:
		q = q.filter(models.Ticket.priority == priority)
	if assignee:
		q = q.filter(models.Ticket.assignee == assignee)
	if created_from:
		q = q.filter(models.Ticket.created_at >= created_from)
	if created_to:
		q = q.filter(models.Ticket.created_at <= created_to)

	sort_col = getattr(models.Ticket, sort_by if sort_by in {"created_at", "updated_at", "priority", "status", "assignee"} else "created_at")
	q = q.order_by(sort_col.desc() if order == "desc" else sort_col.asc())
	return q.all()


def update_ticket(db: Session, ticket: models.Ticket, ticket_in: schemas.TicketUpdate) -> models.Ticket:
	for field, value in ticket_in.model_dump(exclude_unset=True).items():
		setattr(ticket, field, value)
	if ticket.status in (models.StatusEnum.resolved, models.StatusEnum.closed) and not ticket.resolved_at:
		ticket.resolved_at = datetime.utcnow()
	ticket.updated_at = datetime.utcnow()
	db.add(ticket)
	db.commit()
	db.refresh(ticket)
	return ticket


def delete_ticket(db: Session, ticket: models.Ticket) -> None:
	db.delete(ticket)
	db.commit()


def add_comment(db: Session, ticket: models.Ticket, author: str, content: str) -> models.Comment:
	comment = models.Comment(ticket_id=ticket.id, author=author, content=content)
	db.add(comment)
	ticket.updated_at = datetime.utcnow()
	db.add(ticket)
	db.commit()
	db.refresh(comment)
	return comment


def add_attachment(
	db: Session,
	ticket: models.Ticket,
	filename: str,
	content_type: Optional[str],
	size_bytes: Optional[int],
	path: str,
) -> models.Attachment:
	attachment = models.Attachment(
		ticket_id=ticket.id,
		filename=filename,
		content_type=content_type,
		size_bytes=size_bytes,
		path=path,
	)
	db.add(attachment)
	ticket.updated_at = datetime.utcnow()
	db.add(ticket)
	db.commit()
	db.refresh(attachment)
	return attachment


def kpi_report(db: Session) -> schemas.KPIReport:
	# Totals
	total = db.query(func.count(models.Ticket.id)).scalar() or 0

	# Recent (30d)
	thirty_days_ago = datetime.utcnow() - timedelta(days=30)
	recent = (
		db.query(func.count(models.Ticket.id))
		.filter(models.Ticket.created_at >= thirty_days_ago)
		.scalar()
		or 0
	)

	# Resolution time average (days)
	res_times = (
		db.query(models.Ticket.created_at, models.Ticket.resolved_at)
		.filter(models.Ticket.resolved_at.isnot(None))
		.all()
	)
	if res_times:
		avg_days = int(
			sum((r - c).days for c, r in res_times) / max(len(res_times), 1)
		)
	else:
		avg_days = 0

	# Priority counts
	priority_counts = {
		"high": db.query(func.count(models.Ticket.id)).filter(models.Ticket.priority == models.PriorityEnum.high).scalar() or 0,
		"medium": db.query(func.count(models.Ticket.id)).filter(models.Ticket.priority == models.PriorityEnum.medium).scalar() or 0,
		"low": db.query(func.count(models.Ticket.id)).filter(models.Ticket.priority == models.PriorityEnum.low).scalar() or 0,
	}

	# Category counts
	category_rows = db.query(models.Ticket.category, func.count(models.Ticket.id)).group_by(models.Ticket.category).all()
	category_counts = {row[0] or "other": row[1] for row in category_rows}

	# Assignee workload
	assignee_rows = (
		db.query(
			models.Ticket.assignee,
			func.count(models.Ticket.id),
			func.sum(func.case((models.Ticket.status == models.StatusEnum.open, 1), else_=0)),
			func.sum(func.case((models.Ticket.status == models.StatusEnum.in_progress, 1), else_=0)),
			func.sum(func.case((models.Ticket.status == models.StatusEnum.resolved, 1), else_=0)),
			func.sum(func.case((models.Ticket.status == models.StatusEnum.closed, 1), else_=0)),
		)
		.group_by(models.Ticket.assignee)
		.all()
	)
	assignee_workload = {}
	for row in assignee_rows:
		assignee_workload[row[0]] = {
			"total": int(row[1] or 0),
			"open": int(row[2] or 0),
			"in-progress": int(row[3] or 0),
			"resolved": int(row[4] or 0),
			"closed": int(row[5] or 0),
		}

	return schemas.KPIReport(
		total_tickets=int(total),
		recent_30d=int(recent),
		avg_resolution_days=int(avg_days),
		priority_counts=priority_counts,
		category_counts=category_counts,
		assignee_workload=assignee_workload,
	)


