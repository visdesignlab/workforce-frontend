from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from server.db_def import Session, engine


DBSession = sessionmaker(bind=engine)
session = DBSession()
