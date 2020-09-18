from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())

#create declarative_base instance
Base = declarative_base()

class Session(Base):
    __tablename__ = 'session'

    id = Column(Integer, primary_key=True)
    email = Column(String(150), nullable=False, unique=True)
    token = Column(String(32), nullable=False, unique=True)
    generated = Column(DateTime(), nullable=False)
    expires = Column(DateTime(), nullable=False)

engine = create_engine(
    f"mysql+mysqldb://{os.getenv('MYSQL_USER')}:{os.getenv('MYSQL_PASS')}@{os.getenv('MYSQL_HOST')}/{os.getenv('MYSQL_DB')}"
)

Base.metadata.create_all(engine)
