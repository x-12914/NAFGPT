import os
import jwt
import datetime
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# RAG specific imports
from langchain_community.document_loaders import PDFPlumberLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
# HARDCODED for absolute stability in dev environment
SECRET_KEY = "naf-intelligence-alpha-protocol-secure-key-2026-v2-stable"

if not os.getenv("OPENAI_API_KEY"):
    print("\n[WARNING] OPENAI_API_KEY not found in environment!")
FAISS_INDEX_PATH = "faiss_index"
UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# --- SECURITY HANDLERS ---

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            print("Auth Debug: No Authorization header found!")
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            # Token format: "Bearer <token>"
            token_parts = token.split(" ")
            if len(token_parts) < 2:
                print("Auth Debug: Token format is not 'Bearer <token>'")
                return jsonify({'message': 'Invalid Token Format!'}), 401
            
            clean_token = token_parts[1]
            print(f"Auth Debug: Decoding token starting with {clean_token[:10]}...")
            data = jwt.decode(clean_token, SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            print("Auth Debug: Token has expired!")
            return jsonify({'message': 'Token expired!'}), 401
        except jwt.InvalidTokenError as e:
            print(f"Auth Debug: Signature failed! Error: {e}")
            return jsonify({'message': 'Token is invalid!'}), 401
        except Exception as e:
            print(f"Auth Debug: General error: {e}")
            return jsonify({'message': 'Auth Error!'}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/login', methods=['POST'])
def login():
    auth = request.json
    print(f"Auth Debug: Login attempt for user: {auth.get('username')}")
    
    if auth and auth.get('username') == 'admin' and auth.get('password') == 'naf2026':
        token = jwt.encode({
            'user': auth.get('username'),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, SECRET_KEY, algorithm="HS256")
        
        print(f"Auth Debug: Login Success! Token generated with key starting: {SECRET_KEY[:10]}")
        return jsonify({'token': token})

    print("Auth Debug: Login Failed! Invalid credentials.")
    return jsonify({'message': 'Could not verify'}), 401

# --- AI & RAG HANDLERS ---

def get_vectorstore():
    # If the database already exists, load it.
    if os.path.exists(FAISS_INDEX_PATH):
        return FAISS.load_local(
            FAISS_INDEX_PATH, 
            OpenAIEmbeddings(model="text-embedding-3-small"), 
            allow_dangerous_deserialization=True
        )
    return None

@app.route('/chat', methods=['POST'])
@token_required
def chat():
    data = request.json
    query = data.get('query')
    
    vectorstore = get_vectorstore()
    if not vectorstore:
        return jsonify({'answer': 'Knowledge base is empty. Please upload documents first.'})

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    system_prompt = (
        "You are an internal knowledge assistant for the Nigerian Air Force. "
        "Use the retrieved context to answer. If not there, say you don't know.\n\n"
        "Context:\n{context}"
    )
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])
    
    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
    
    # helper function to format documents
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    # LCEL Chain: Context -> Prompt -> LLM -> Output
    rag_chain = (
        {"context": retriever | format_docs, "input": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    
    answer = rag_chain.invoke(query)
    return jsonify({'answer': answer})

@app.route('/summarize', methods=['POST'])
@token_required
def summarize():
    data = request.json
    text_to_summarize = data.get('text')
    
    if not text_to_summarize:
        return jsonify({'message': 'No text provided'}), 400

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.5)
    prompt = f"Provide a high-level military intelligence summary of the following text. Use bullet points for key threats, actions, and observations:\n\n{text_to_summarize}"
    
    response = llm.invoke(prompt)
    return jsonify({'summary': response.content})

@app.route('/upload', methods=['POST'])
@token_required
def upload_file():
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    
    if file and file.filename.endswith('.pdf'):
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        
        # Trigger Enhanced Ingestion
        loader = PDFPlumberLoader(file_path)
        docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1200, chunk_overlap=300)
        splits = text_splitter.split_documents(docs)
        
        new_vs = FAISS.from_documents(splits, OpenAIEmbeddings(model="text-embedding-3-small"))
        
        # Merge with existing if available
        existing_vs = get_vectorstore()
        if existing_vs:
            existing_vs.merge_from(new_vs)
            existing_vs.save_local(FAISS_INDEX_PATH)
        else:
            new_vs.save_local(FAISS_INDEX_PATH)
            
        return jsonify({'message': f'File {file.filename} uploaded and processed into knowledge base.'})

    return jsonify({'message': 'Only PDF files are allowed.'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5006, debug=True)
