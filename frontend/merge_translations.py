import json
import os
import glob

def merge_messages(locale):
    main_file = f'src/messages/{locale}.json'
    try:
        with open(main_file, 'r', encoding='utf-8') as f:
            main_data = json.load(f)
    except FileNotFoundError:
        main_data = {}

    components_pattern = f'src/messages/components/*_{locale}.json'
    for comp_file in glob.glob(components_pattern):
        try:
            with open(comp_file, 'r', encoding='utf-8') as f:
                comp_data = json.load(f)
            # Merge comp_data into main_data
            for k, v in comp_data.items():
                if isinstance(v, dict) and k in main_data and isinstance(main_data[k], dict):
                    main_data[k].update(v)
                else:
                    main_data[k] = v
        except Exception as e:
            print(f"Error reading {comp_file}: {e}")

    with open(main_file, 'w', encoding='utf-8') as f:
        json.dump(main_data, f, ensure_ascii=False, indent=2)

def main():
    for locale in ['ko', 'en', 'ja']:
        merge_messages(locale)
    print("All component messages merged successfully!")

if __name__ == "__main__":
    main()
