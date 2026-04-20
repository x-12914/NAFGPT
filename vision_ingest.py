import os
import fitz  # PyMuPDF
import base64
import time
from io import BytesIO
from PIL import Image
from dotenv import load_dotenv
from openai import OpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def vision_transcribe(pdf_path):
    print(f"--- Starting Resilient Vision-Enhanced Transcription for {pdf_path} ---")
    doc = fitz.open(pdf_path)
    all_text_docs = []
    
    if not os.path.exists("page_images"):
        os.makedirs("page_images")

    for page_num in range(len(doc)):
        print(f"Processing Page {page_num + 1}/{len(doc)}...")
        page = doc.load_page(page_num)
        pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5)) # 1.5x scale is enough and faster
        img_path = f"page_images/page_{page_num}.png"
        pix.save(img_path)
        
        base64_image = encode_image(img_path)
        
        page_text = ""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": "Transcribe this PDF page into clean Markdown. Extact all text from charts, diagrams, and figures."},
                                {
                                    "type": "image_url",
                                    "image_url": { "url": f"data:image/png;base64,{base64_image}" }
                                }
                            ]
                        }
                    ],
                    max_tokens=2000
                )
                page_text = response.choices[0].message.content
                break 
            except Exception as e:
                print(f"  Attempt {attempt+1} failed for Page {page_num+1}: {e}")
                if "rate_limit" in str(e).lower() and attempt < max_retries - 1:
                    wait_time = 20 * (attempt + 1)
                    print(f"  Rate limit hit. Waiting {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    page_text = f"Error transcribing page {page_num+1}"
                    break

        all_text_docs.append(Document(page_content=page_text, metadata={"page": page_num + 1, "source": pdf_path}))
        os.remove(img_path)
        
        # Mandatory small sleep for TPM pacing
        time.sleep(1)

    print("--- Vision Transcription Complete ---")
    return all_text_docs

def build_index(pdf_path, index_path="faiss_index"):
    documents = vision_transcribe(pdf_path)
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=300)
    splits = text_splitter.split_documents(documents)
    
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vectorstore = FAISS.from_documents(splits, embeddings)
    vectorstore.save_local(index_path)
    print(f"Successfully indexed {len(splits)} visual-aware chunks.")

if __name__ == "__main__":
    build_index("final-ncap-2-0.pdf")
