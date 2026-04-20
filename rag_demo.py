import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain

# Load environment variables (from .env file)
load_dotenv()

# Initialize API Keys (Requires OPENAI_API_KEY in .env file)
if not os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY") == "your_openai_api_key_here":
    print("\n[ERROR] Please add your OpenAI API key to the .env file")
    print("If you don't have a .env file, copy .env.example to .env and put your key inside.")
    exit()

PDF_PATH = "final-ncap-2-0.pdf"
DB_DIR = "./faiss_index"

def ingest_pdf():
    if not os.path.exists(PDF_PATH):
        print(f"\n[ERROR] I couldn't find the file '{PDF_PATH}'. Ensure it's in the same folder as this script.")
        exit()
        
    print(f"\n--- Loading PDF: {PDF_PATH} ---")
    loader = PyPDFLoader(PDF_PATH)
    docs = loader.load()
    
    print(f"Loaded {len(docs)} pages. Splitting into readable chunks...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)
    
    print(f"Created {len(splits)} chunks. Generating maths embeddings and storing in ChromaDB database...")
    # This might take a few moments depending on the size of the PDF
    vectorstore = FAISS.from_documents(
        documents=splits, 
        embedding=OpenAIEmbeddings(model="text-embedding-3-small")
    )
    vectorstore.save_local(DB_DIR)
    print(f"Ingestion complete! Local AI database saved to folder '{DB_DIR}'")
    return vectorstore

def ask_question(vectorstore, query):
    print(f"\nSearching database for: {query}...")
    
    # Initialize the LLM (Using gpt-4o-mini for speed and cost-effectiveness)
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    
    # Create the prompt template (system instructions)
    system_prompt = (
        "You are an internal knowledge assistant for the Nigerian Air Force. "
        "Use the following pieces of retrieved context from official documents to answer the question. "
        "If the answer is not in the attached context, politely say that you don't know based on the provided document. "
        "Do not invent or hallucinate answers.\n\n"
        "Context:\n{context}"
    )
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])
    
    # Build the RAG chain
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4}) # retrieve top 4 most relevant chunks
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    
    # Run the query
    result = rag_chain.invoke({"input": query})
    print("\n--- AI Response ---")
    print(result["answer"])
    print("-------------------")

if __name__ == "__main__":
    vectorstore = None
    
    # If the database already exists, load it to save money and time. Otherwise, read and ingest the PDF.
    if os.path.exists(DB_DIR):
        print("\nFound existing database. Loading vectors...")
        vectorstore = FAISS.load_local(DB_DIR, OpenAIEmbeddings(model="text-embedding-3-small"), allow_dangerous_deserialization=True)
    else:
        vectorstore = ingest_pdf()

    # Interactive terminal chat loop
    print("\n=== Nigerian Air Force Document Assistant ===")
    print("Type 'exit' to quit")
    
    while True:
        user_input = input("\nAsk a question about the document: ")
        if user_input.lower() in ['quit', 'exit']:
            break
        if user_input.strip() == "":
            continue
            
        ask_question(vectorstore, user_input)
