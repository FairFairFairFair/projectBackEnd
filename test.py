from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes 
from cryptography.hazmat.primitives import padding 
from cryptography.hazmat.backends import default_backend 
import os

# สร้างคีย์ 32 ไบต์ (256-bit)
KEY = os.urandom(32)

def encrypt(plain_text):
    iv = os.urandom(16)  # สร้าง IV ขนาด 16 ไบต์
    
    # เติมข้อมูลให้ครบ block size (AES ใช้ 16 ไบต์ต่อบล็อก)
    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(plain_text.encode()) + padder.finalize()
    
    # เข้ารหัสด้วย AES-CBC
    cipher = Cipher(algorithms.AES(KEY), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    cipher_text = encryptor.update(padded_data) + encryptor.finalize()
    
    return iv + cipher_text  # คืนค่า IV + ข้อความที่เข้ารหัส

# ทดสอบเข้ารหัส
message = "Hello, World!"
encrypted_message = encrypt(message)
print(f"Encrypted: {encrypted_message.hex()}")
