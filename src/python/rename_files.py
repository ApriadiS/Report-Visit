import os

folder = "batch_20251105_235801"
files = sorted([f for f in os.listdir(folder) if f.startswith("generated-raw_")])

for i, old_name in enumerate(files, start=156):
    old_path = os.path.join(folder, old_name)
    new_name = f"IMG_{i:04d}.jpg"
    new_path = os.path.join(folder, new_name)
    os.rename(old_path, new_path)
    print(f"{old_name} -> {new_name}")


    