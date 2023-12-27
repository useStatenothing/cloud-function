import express from "express";
import dotenv from "dotenv";
import { HuggingFaceInferenceEmbeddings } from "langchain/embeddings/hf";
import { HuggingFaceInference } from "langchain/llms/hf";
import { FaissStore } from "langchain/vectorstores/faiss";
import { loadQAStuffChain } from "langchain/chains";
import { db } from "./firebaseConfig.mjs";
import {TextLoader} from "langchain/document_loaders/fs/text"
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { get, ref } from "firebase/database";
import { p2f } from "./content.mjs";
import cors from "cors"


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const model = new HuggingFaceInference({ apiKey: `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`, model: "HuggingFaceH4/zephyr-7b-beta" });
const embeddings = new HuggingFaceInferenceEmbeddings({ apiKey: `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` });
const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 800, chunkOverlap: 200 });


// const loader = new TextLoader("./content.txt")
// const p2f_docs = await loader.loadAndSplit()

const p2f_doc = await splitter.createDocuments([p2f])
const p2f_vec = await FaissStore.fromDocuments(p2f_doc, embeddings)
const p2l_llm = await loadQAStuffChain(model)




let initialized = false;
let vectordb;
let llm_chain;

const initializeData = async () => {
    console.log("Initialization is called");
    try {
        let docs = "";
        const snapshot = await get(ref(db, "TATA"));

        if (snapshot.exists()) {
            docs = JSON.parse(snapshot.val());
        }

        const doc = await splitter.splitDocuments(docs);
        vectordb = await FaissStore.fromDocuments(doc, embeddings);
        llm_chain = await loadQAStuffChain(model);
        console.log("function is initialized");

        initialized = true;
    } catch (err) {
        console.error("Error during initialization:", err);
        throw err;
    }
};

// Initialize data on server startup
initializeData().catch(error => console.error('Error during server startup:', error));

app.get("/", async (req, res) => {
    try {
        if (!initialized) {
            console.log("Initialization not complete yet.");
            res.status(500).send("Server not initialized yet.");
            return;
        }

        const query = "give me the list of contents from the manual in brief manner";
        const vector_similarity = await vectordb.similaritySearch(query);
        const response = await llm_chain.call({ input_documents: vector_similarity, question: query });
        const chat = { query, response: response.text };

        res.send(chat);
    } catch (err) {
        console.error("Error in GET request:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/", async (req, res) => {
    
    try {
        if (!initialized) {
            console.log("Initialization not complete yet.");
            res.status(500).send("Server not initialized yet.");
            return;
        }

        const query = req.body.query ;
        const vector_similarity = await vectordb.similaritySearch(query);
        const response = await llm_chain.call({ input_documents: vector_similarity, question: query });
        const chat = { query, response: response.text };
        console.log(chat.response)
        res.send(chat.response);
    } catch (err) {
        console.error("Error in POST request:", err);
        res.status(500).send("Internal Server Error");
    }
});


app.get("/p2f",  async(req, res)=>{
    res.send("app is runnning")
})
app.post("/p2f", async (req, res) => {
    
    try {
        if (!initialized) {
            console.log("Initialization not complete yet.");
            res.status(500).send("Server not initialized yet.");
            return;
        }

        const query = req.body.query ;
        const vector_similarity = await p2f_vec.similaritySearch(query);
        const response = await p2l_llm.call({ input_documents: vector_similarity, question: query });
        const chat = { query, response: response.text };
        console.log(chat.response)
        res.send(chat.response);
    } catch (err) {
        console.error("Error in POST request:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(3000, () => {
    console.log(`Server is running on port: 3000`);
});
