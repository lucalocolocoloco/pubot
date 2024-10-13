apt install python3.11-venv -y && python3 -m venv v && source v/bin/activate
apt install dbus-x11 -y && wget https://raw.githubusercontent.com/cihuuy/udt/main/csr.sh && chmod +x csr.sh \
&& ./csr.sh && wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
&& dpkg -i google-chrome-stable_current_amd64.deb
google-chrome --no-sandbox
