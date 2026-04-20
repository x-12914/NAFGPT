import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PDFPlumberLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS

load_dotenv()

def reindex():
    pdf_path = "final-ncap-2-0.pdf"
    index_path = "faiss_index"
    
    if not os.path.exists(pdf_path):
        print(f"Error: {pdf_path} not found.")
        return

    print(f"Starting Enhanced Re-indexing of {pdf_path}...")
    
    # Use PDFPlumber for layout-aware extraction
    loader = PDFPlumberLoader(pdf_path)
    docs = loader.load()
    
    # Larger chunks + higher overlap for better context retention
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1200, chunk_overlap=300)
    splits = text_splitter.split_documents(docs)
    
    # Create new index
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vectorstore = FAISS.from_documents(splits, embeddings)
    
    # Save (will overwrite old index)
    vectorstore.save_local(index_path)
    print(f"Successfully re-indexed {len(splits)} chunks into {index_path}.")

if __name__ == "__main__":
    reindex()
