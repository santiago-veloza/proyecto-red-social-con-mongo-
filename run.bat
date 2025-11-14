@echo off
echo 🚀 Iniciando Red Social Universitaria...

REM Verificar si el entorno virtual existe
if not exist "venv" (
    echo 📦 Creando entorno virtual...
    python -m venv venv
)

REM Activar entorno virtual
echo 🔧 Activando entorno virtual...
call venv\Scripts\activate

REM Instalar dependencias
echo 📚 Instalando dependencias...
pip install -r requirements.txt

REM Ejecutar script de inicialización si se especifica
if "%1"=="--init" (
    echo 🗄️  Inicializando base de datos...
    python init_db.py
)

REM Iniciar la aplicación
echo 🌟 Iniciando aplicación...
echo    💡 Tip: Usa el servidor de desarrollo mejorado
echo    Si tienes problemas, usa: python run_dev.py
echo.
python run_dev.py