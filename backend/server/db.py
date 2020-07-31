from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from server.db_def import Session, Base

engine = create_engine('sqlite:///sessions.db')
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
session = DBSession()
