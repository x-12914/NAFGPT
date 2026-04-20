from langchain_community.document_loaders import PyPDFLoader

PDF_PATH = "final-ncap-2-0.pdf"

loader = PyPDFLoader(PDF_PATH)
docs = loader.load()

# Read pages 17 to 20
for i in range(16, 20):
    print(f"--- Page {i+1} ---")
    print(docs[i].page_content)
    print("\n")
