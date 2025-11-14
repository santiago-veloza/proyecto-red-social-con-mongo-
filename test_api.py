#!/usr/bin/env python3
"""
Script de prueba para verificar que la API funciona
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from api.index import app
    print("✅ Importación exitosa de api.index")
    
    with app.test_client() as client:
        # Probar health endpoint
        response = client.get('/health')
        print(f"Health Status: {response.status_code}")
        print(f"Health Response: {response.get_json()}")
        
        # Probar root endpoint
        response = client.get('/')
        print(f"Root Status: {response.status_code}")
        print(f"Root Response: {response.get_json()}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()