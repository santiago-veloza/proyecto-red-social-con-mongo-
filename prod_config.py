"""
Configuración para producción en Vercel
"""

import os

class ProductionConfig:
    """Configuración para despliegue en Vercel"""
    
    # Flask Settings
    DEBUG = False
    TESTING = False
    
    # MongoDB Settings - usando variable de entorno
    MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://santiagoveloza02:99qDCmGJWVdSHfFR@cluster0.7bfap.mongodb.net/red_social_ucc?retryWrites=true&w=majority")
    DB_NAME = "red_social_ucc"
    
    # Security
    SECRET_KEY = os.getenv("SECRET_KEY", "ucc-secret-key-production-2024")
    
    # Producción
    ENV = 'production'
    
    # Configuración específica UCC
    UNIVERSITY_NAME = 'Universidad Cooperativa de Colombia'
    UNIVERSITY_SHORT = 'UCC'
    UNIVERSITY_DOMAIN = 'ucc.edu.co'
    
    # Configuración CORS para producción
    CORS_ORIGINS = ["*"]  # En producción, especifica dominios específicos
    
    # Configuración de logging
    LOG_LEVEL = 'ERROR'

# Alias
Config = ProductionConfig