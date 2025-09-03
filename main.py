from fastapi import FastAPI, Depends, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List, Optional
from sqlalchemy.orm import Session
import os
import shutil
from datetime import datetime

from .database import Base, engine, get_db
from . import models, schemas, crud


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(title="Ticket Tracking API", version="1.0.0")

# CORS for local frontend
app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


# Uploads directory and static serving
BASE_DIR = os.path.dirname(__file__)
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/health")
def health():
	return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


# Tickets CRUD
@app.post("/tickets", response_model=schemas.Ticket)
async def create_ticket(
	*,
	db: Session = Depends(get_db),
	title: str = Form(...),
	description: str = Form(...),
	priority: models.PriorityEnum = Form(models.PriorityEnum.medium),
	assignee: str = Form(...),
	category: Optional[str] = Form("other"),
	status: models.StatusEnum = Form(models.StatusEnum.open),
	files: Optional[List[UploadFile]] = File(default=None),
):
	ticket_in = schemas.TicketCreate(
		title=title,
		description=description,
		priority=priority,
		assignee=assignee,
		category=category or "other",
		status=status,
	)
	ticket = crud.create_ticket(db, ticket_in)

	# Save files if provided
	if files:
		for f in files:
			if not f.filename:
				continue
			file_path = os.path.join(UPLOAD_DIR, f"{ticket.id}_{int(datetime.utcnow().timestamp())}_{f.filename}")
			with open(file_path, "wb") as out_file:
				shutil.copyfileobj(f.file, out_file)
			crud.add_attachment(
				db,
				ticket,
				filename=f.filename,
				content_type=f.content_type,
				size_bytes=None,
				path=f"/uploads/{os.path.basename(file_path)}",
			)
		db.refresh(ticket)

	return ticket


@app.get("/tickets", response_model=List[schemas.Ticket])
def list_tickets(
	*,
	db: Session = Depends(get_db),
	status: Optional[models.StatusEnum] = None,
	priority: Optional[models.PriorityEnum] = None,
	assignee: Optional[str] = None,
	created_from: Optional[datetime] = None,
	created_to: Optional[datetime] = None,
	sort_by: str = "created_at",
	order: str = "desc",
):
	tickets = crud.list_tickets(
		db,
		status=status,
		priority=priority,
		assignee=assignee,
		created_from=created_from,
		created_to=created_to,
		sort_by=sort_by,
		order=order,
	)
	return tickets


@app.get("/tickets/{ticket_id}", response_model=schemas.Ticket)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
	ticket = crud.get_ticket(db, ticket_id)
	if not ticket:
		raise HTTPException(status_code=404, detail="Ticket not found")
	return ticket


@app.put("/tickets/{ticket_id}", response_model=schemas.Ticket)
def update_ticket(ticket_id: int, ticket_in: schemas.TicketUpdate, db: Session = Depends(get_db)):
	ticket = crud.get_ticket(db, ticket_id)
	if not ticket:
		raise HTTPException(status_code=404, detail="Ticket not found")
	return crud.update_ticket(db, ticket, ticket_in)


@app.delete("/tickets/{ticket_id}", status_code=204)
def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
	ticket = crud.get_ticket(db, ticket_id)
	if not ticket:
		raise HTTPException(status_code=404, detail="Ticket not found")
	crud.delete_ticket(db, ticket)
	return None


@app.post("/tickets/{ticket_id}/comments", response_model=schemas.Comment)
def add_comment(ticket_id: int, content: str = Form(...), author: str = Form("User"), db: Session = Depends(get_db)):
	ticket = crud.get_ticket(db, ticket_id)
	if not ticket:
		raise HTTPException(status_code=404, detail="Ticket not found")
	comment = crud.add_comment(db, ticket, author=author, content=content)
	return comment


@app.post("/tickets/{ticket_id}/attachments", response_model=schemas.Ticket)
async def upload_attachments(ticket_id: int, files: List[UploadFile] = File(...), db: Session = Depends(get_db)):
	ticket = crud.get_ticket(db, ticket_id)
	if not ticket:
		raise HTTPException(status_code=404, detail="Ticket not found")
	for f in files:
		if not f.filename:
			continue
		file_path = os.path.join(UPLOAD_DIR, f"{ticket.id}_{int(datetime.utcnow().timestamp())}_{f.filename}")
		with open(file_path, "wb") as out_file:
			shutil.copyfileobj(f.file, out_file)
		crud.add_attachment(
			db,
			ticket,
			filename=f.filename,
			content_type=f.content_type,
			size_bytes=None,
			path=f"/uploads/{os.path.basename(file_path)}",
		)
	db.refresh(ticket)
	return ticket


# KPIs
@app.get("/reports/kpi", response_model=schemas.KPIReport)
def get_kpi_report(db: Session = Depends(get_db)):
	return crud.kpi_report(db)


