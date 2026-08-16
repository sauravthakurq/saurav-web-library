import os
import re

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception:
        return
        
    masked = []
    def mask_func(match):
        masked.append(match.group(0))
        return f"__MASKED_COPYRIGHT_{len(masked)-1}__"
    
    content = re.sub(r'Copyright\s*\(c\)\s*\d{4}\s*Pulkit', mask_func, content, flags=re.IGNORECASE)
    content = re.sub(r'Copyright\s*©\s*\d{4}\s*Pulkit', mask_func, content, flags=re.IGNORECASE)
    
    new_content = content
    # Socials and links
    new_content = new_content.replace("https://github.com/pulkitxm", "https://github.com/sauravthakurq")
    new_content = new_content.replace("pulkitxm.com", "sauravthakurx.vercel.app")
    new_content = new_content.replace("pulkitxm", "sauravthakurq")
    new_content = new_content.replace("claude-directory", "saurav-web-library")
    new_content = new_content.replace("Claude Directory", "Saurav Web Library")
    
    # Specific dev credits
    new_content = re.sub(r'Designed by Pulkit', 'Designed & Developed by Saurav Thakur', new_content, flags=re.IGNORECASE)
    new_content = re.sub(r'Developed by Pulkit', 'Designed & Developed by Saurav Thakur', new_content, flags=re.IGNORECASE)
    new_content = re.sub(r'Created by Pulkit', 'Built by Saurav Thakur', new_content, flags=re.IGNORECASE)
    new_content = re.sub(r'Built by Pulkit', 'Built by Saurav Thakur', new_content, flags=re.IGNORECASE)
    new_content = re.sub(r'Made by Pulkit', 'Built by Saurav Thakur', new_content, flags=re.IGNORECASE)
    
    # Other Pulkit mentions
    new_content = re.sub(r'\bPulkit\b', 'Saurav Thakur', new_content)
    
    # Unmask copyrights
    for i, m in enumerate(masked):
        new_content = new_content.replace(f"__MASKED_COPYRIGHT_{i}__", m)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root:
        continue
    for f in files:
        if f.endswith(('.html', '.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.css', '.yaml', '.yml')):
            process_file(os.path.join(root, f))
