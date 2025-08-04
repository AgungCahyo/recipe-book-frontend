import os

def generate_tree(path, prefix=''):
    entries = os.listdir(path)
    entries.sort()
    tree = ''
    for i, entry in enumerate(entries):
        full_path = os.path.join(path, entry)
        connector = '└── ' if i == len(entries) - 1 else '├── '
        tree += prefix + connector + entry + '\n'
        if os.path.isdir(full_path):
            extension = '    ' if i == len(entries) - 1 else '│   '
            tree += generate_tree(full_path, prefix + extension)
    return tree

root = os.getcwd()

# tulis langsung ke file
with open("project_structure.txt", "w", encoding="utf-8") as f:
    f.write(generate_tree(root))