import os

folder = "batch_20251105_235801"
files = os.listdir(folder)

for old_name in files:
    name, ext = os.path.splitext(old_name)
    if ext != ".jpg":
        old_path = os.path.join(folder, old_name)
        new_name = name + ".jpg"
        new_path = os.path.join(folder, new_name)
        os.rename(old_path, new_path)
        print(f"{old_name} -> {new_name}")
