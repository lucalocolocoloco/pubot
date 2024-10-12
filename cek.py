import pyautogui
import time

# Fungsi untuk mencatat koordinat layar
def record_coordinates():
    # Buat daftar untuk menyimpan titik koordinat
    coordinates = []

    print("Pindahkan mouse ke lokasi yang ingin Anda catat. Tekan 'Ctrl + C' untuk mengakhiri.")

    try:
        while True:
            # Dapatkan koordinat mouse saat ini
            x, y = pyautogui.position()
            coordinates.append((x, y))
            print(f"Koordinat: ({x}, {y})")
            time.sleep(1)  # Tunggu 1 detik
    except KeyboardInterrupt:
        print("\nMencatat koordinat selesai.")
        return coordinates

if __name__ == "__main__":
    # Panggil fungsi untuk mencatat koordinat
    recorded_coordinates = record_coordinates()

    # Tampilkan koordinat yang dicatat
    print("Koordinat yang dicatat:")
    for coord in recorded_coordinates:
        print(coord)
