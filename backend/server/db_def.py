from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy import create_engine

#create declarative_base instance
Base = declarative_base()

class Session(Base):
    __tablename__ = 'session'

    id = Column(Integer, primary_key=True)
    email = Column(String(250), nullable=False, unique=True)
    token = Column(String(32), nullable=False, unique=True)
    generated = Column(DateTime(), nullable=False)
    expires = Column(DateTime(), nullable=False)

engine = create_engine('sqlite:///sessions.db')

Base.metadata.create_all(engine)
