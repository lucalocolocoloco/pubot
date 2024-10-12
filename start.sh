#!/bin/bash
# Ubah direktori ke /home/coder/project
cd /home/coder/project
python3 -m venv v 
source v/bin/activate 
pip install pyautogui 
npm install axios
npm install moment
npm install puppeteer
npm install dotenv
# Mulai code-server tanpa otentikasi pada port 6090
echo "Starting code-server..."
code-server --bind-addr 0.0.0.0:8080 --auth none . &

# Tunggu selama 10 detik agar code-server siap


