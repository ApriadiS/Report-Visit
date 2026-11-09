import os
import csv

# Input directory
directory = input("Masukkan path directory: ").strip()

if not os.path.exists(directory):
    print(f"Directory tidak ditemukan: {directory}")
    exit()

# Ambil semua file timestamp
files = sorted([f for f in os.listdir(directory) if f.startswith("timestamp_") and f.endswith(".jpg")])

if not files:
    print("Tidak ada file dengan format timestamp_*.jpg")
    exit()

# Buat CSV
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
output_dir = os.path.join(root_dir, "data", "output")
os.makedirs(output_dir, exist_ok=True)
csv_path = os.path.join(output_dir, "Book1.csv")
with open(csv_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f, delimiter=";")
    writer.writerow(["Store ID", "ClockIn/Out", "Date", "Hour", "Minute", "PM/AM", "ImagePath"])
    
    for file in files:
        # Parse filename: timestamp_20251107_130134_12781_IN.jpg
        parts = file.replace(".jpg", "").split("_")
        date_str = parts[1]  # 20251107
        time_str = parts[2]  # 130134
        store_id = parts[3]  # 12781
        clock_in_out = parts[4].lower()  # IN -> in
        
        # Convert date: 20251107 -> 11072025
        year = date_str[:4]
        month = date_str[4:6]
        day = date_str[6:8]
        date = f"{month}{day}{year}"
        
        # Extract hour and minute (keep as string to preserve leading zeros)
        hour = time_str[:2]
        minute = time_str[2:4]
        
        # Determine AM/PM
        pm_am = "pm" if int(hour) >= 12 else "am"
        
        # Rename file: timestamp_20251107_130134_12781_IN.jpg -> timestamp_20251107_1301.jpg
        new_filename = f"timestamp_{date_str}_{hour}{minute}.jpg"
        new_file_path = os.path.join(directory, new_filename)
        old_file_path = os.path.join(directory, file)
        
        # Full path (gunakan nama file baru)
        full_path = os.path.abspath(new_file_path)
        
        # Write row
        writer.writerow([store_id, clock_in_out, date, hour, minute, pm_am, full_path])
        
        # Rename file
        os.rename(old_file_path, new_file_path)
        print(f"Renamed: {file} -> {new_filename}")

print(f"CSV berhasil dibuat: {csv_path}")
print(f"Total {len(files)} file diproses")
