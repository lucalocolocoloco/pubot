#!/bin/bash
# Ubah direktori ke /home/coder/project
cd /home/coder/project

# Membuat pengguna baru 'fbbot' tanpa password dan menambahkannya ke grup 'sudo'
sudo adduser --disabled-password --gecos "" fbbot
sudo usermod -aG sudo fbbot

# Membuat virtual environment Python
python3 -m venv v 
source v/bin/activate 

# Menginstal paket Python dan Node.js
pip install pyautogui 
npm install axios
npm install moment
npm install puppeteer
npm install dotenv

# Mulai code-server tanpa otentikasi pada port 8080
echo "Starting code-server..."
code-server --bind-addr 0.0.0.0:8080 --auth none . &

# Tunggu selama 10 detik agar code-server siap
sleep 4

# Mencegah script keluar dan container berhenti
echo "Code-server is running. Keeping the container alive..."
tail -f /dev/null
