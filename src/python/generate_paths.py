import os

folder = "batch-1762261189103"
files = sorted(os.listdir(folder))

with open("file_paths.txt", "w") as f:
    for file in files:
        full_path = os.path.abspath(os.path.join(folder, file))
        f.write(full_path + "\n")

print(f"Path lengkap {len(files)} file telah disimpan ke file_paths.txt")
