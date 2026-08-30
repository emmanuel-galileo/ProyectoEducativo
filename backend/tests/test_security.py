import pytest
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token

def test_password_hashing_and_verification():
    password = "AdminSecret123!"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_pin_hashing_and_verification():
    pin = "1234"
    hashed = get_password_hash(pin)
    assert verify_password(pin, hashed) is True
    assert verify_password("0000", hashed) is False

def test_jwt_creation_and_decoding():
    payload = {"sub": "admin-001", "rol": "admin", "nombre": "Carmen"}
    token = create_access_token(payload)
    decoded = decode_access_token(token)
    assert decoded["sub"] == "admin-001"
    assert decoded["rol"] == "admin"
    assert decoded["nombre"] == "Carmen"
