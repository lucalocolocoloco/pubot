import pyautogui
import time
import sys  # Import modul sys untuk keluar dari program

# Setel fail-safe menjadi False
pyautogui.FAILSAFE = False

# Koordinat untuk klik
coordinates = (770, 300)  # Ganti dengan koordinat yang diinginkan

# Menunggu 3 detik sebelum melakukan klik
time.sleep(3)

# Menggerakkan mouse ke koordinat yang ditentukan dan melakukan klik
pyautogui.moveTo(coordinates[0], coordinates[1], duration=0.5)  # Menggerakkan mouse dengan durasi 0.5 detik
pyautogui.click()  # Melakukan klik

# Mengakhiri program
print("Klik sudah dilakukan. Program selesai.")
sys.exit()  # Menutup program
