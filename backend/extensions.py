from flask_limiter import Limiter
from flask import request

def get_real_ip():
    # X-Forwarded-For: client_ip, proxy1, proxy2
    xff = request.headers.get('X-Forwarded-For')
    if xff:
        return xff.split(',')[0].strip()

    return request.remote_addr

limiter = Limiter(
    key_func=get_real_ip,
    default_limits=["300 per day", "100 per hour"],
    storage_uri="memory://",
)
