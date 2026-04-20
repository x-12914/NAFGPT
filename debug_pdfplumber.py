import pdfplumber

def test_extraction():
    path = "final-ncap-2-0.pdf"
    with pdfplumber.open(path) as pdf:
        # Page 18 is index 17
        page = pdf.pages[17]
        print(f"--- Raw Text Page 18 ---")
        print(page.extract_text())
        print("\n--- Tables Found ---")
        print(page.extract_tables())

if __name__ == "__main__":
    test_extraction()
