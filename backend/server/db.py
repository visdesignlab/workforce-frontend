from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from server.db_def import Session, Base

engine = create_engine('sqlite:///sessions.db', connect_args={'check_same_thread': False})
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
session = DBSession()
