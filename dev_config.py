"""
Configuración específica para desarrollo en Windows - UCC
Universidad Cooperativa de Colombia
Evita problemas comunes de threading y sockets
"""

import os
import tempfile

class DevelopmentConfig:
    """Configuración optimizada para desarrollo en Windows - UCC"""
    
    # Flask Settings
    DEBUG = True
    TESTING = False
    
    # Evitar problemas de threading en Windows
    THREADED = True
    
    # MongoDB Settings
    MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://santiagoveloza02:99qDCmGJWVdSHfFR@cluster0.7bfap.mongodb.net/red_social_ucc?retryWrites=true&w=majority")
    
    # Configuración específica UCC
    UNIVERSITY_NAME = 'Universidad Cooperativa de Colombia'
    UNIVERSITY_SHORT = 'UCC'
    UNIVERSITY_DOMAIN = 'ucc.edu.co'
    
    # Security
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    
    # Desarrollo
    ENV = 'development'
    
    # Configuración específica para Windows
    USE_RELOADER = True
    RELOADER_TYPE = 'stat'  # Más estable en Windows que 'watchdog'
    
    # Configuración de red
    HOST = '127.0.0.1'  # Solo localhost
    PORT = 5000
    
    # Logging
    LOG_LEVEL = 'INFO'

# Alias para mantener compatibilidad
Config = DevelopmentConfig