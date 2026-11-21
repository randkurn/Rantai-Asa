import sys
import os

# Tambahkan direktori aplikasi ke path sistem
sys.path.insert(0, os.path.dirname(__file__))

# FastAPI adalah aplikasi ASGI, sedangkan Phusion Passenger di cPanel berjalan pada antarmuka WSGI.
# Menggunakan ASGIMiddleware (a2wsgi) untuk mengonversi FastAPI (ASGI) menjadi WSGI application.
try:
    from a2wsgi import ASGIMiddleware
    from main import app
    application = ASGIMiddleware(app)
except ImportError:
    # Fallback sederhana jika a2wsgi belum terinstall
    from main import app
    application = app
