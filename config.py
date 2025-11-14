import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.getenv('MONGO_URI')
    DB_NAME = os.getenv('DB_NAME', 'red_social_universitaria')
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'