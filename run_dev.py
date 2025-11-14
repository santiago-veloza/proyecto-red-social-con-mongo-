#!/usr/bin/env python3
"""
Script de desarrollo alternativo para Windows
Evita problemas comunes de socket con Flask en Windows
"""

import os
import sys

# Configurar variables de entorno para desarrollo
os.environ['FLASK_ENV'] = 'development'
os.environ['FLASK_DEBUG'] = '1'

from app import app
from dev_config import Config

def run_development_server():
    """Ejecuta el servidor de desarrollo con configuración optimizada para Windows"""
    
    print("🚀 Iniciando UCC - Universidad Cooperativa de Colombia (Modo Desarrollo)...")
    print("📍 Frontend disponible en: http://localhost:5000")
    print("📡 API disponible en: http://localhost:5000/api")
    print("🩺 Health check: http://localhost:5000/api/health")
    print("💡 Tip: Usa Ctrl+C para detener el servidor")
    print("-" * 50)
    
    try:
        # Configuración específica para Windows
        app.run(
            host='127.0.0.1',
            port=5000,
            debug=True,
            use_reloader=True,
            use_debugger=True,
            use_evalex=True,
            threaded=True,
            passthrough_errors=False,
        )
    except KeyboardInterrupt:
        print("\n👋 Servidor detenido por el usuario")
    except Exception as e:
        print(f"❌ Error al iniciar el servidor: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_development_server()