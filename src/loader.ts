import path from "node:path";
import * as dotenv from 'dotenv'
// import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
// import { JSONLoader } from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import {
  // RecursiveCharacterTextSplitter,
  TokenTextSplitter,
} from "langchain/text_splitter";
import { createClient } from "redis";

import { RedisVectorStore } from "langchain/vectorstores/redis";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

// const loader = new DirectoryLoader(path.resolve(__dirname, "../temp"), {
//   ".json": (path) => new JSONLoader(path, "/text"),
// });

// const loader = new JSONLoader(path.resolve(__dirname, '../tmp/lala.json'));

dotenv.config()


const FILENAME = path.resolve(__dirname, "../tmp/transc.txt");

const loader = new TextLoader(FILENAME);

async function load() {
  const docs = await loader.load();

  // console.log(docs);

  // const textSplitter = new RecursiveCharacterTextSplitter({
  //   chunkSize: 200,
  //   chunkOverlap: 20,
  // })

  // const splitter =  await textSplitter.splitDocuments(docs)

  const textSplitter = new TokenTextSplitter({
    encodingName: "cl100k_base",
    chunkSize: 600,
    chunkOverlap: 0,
  });

  const splitter = await textSplitter.splitDocuments(docs);

  console.log(splitter);

  // docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest

  const redis = createClient({
    url: "redis://127.0.0.1:6379",
  });

  await redis.connect();

  await RedisVectorStore.fromDocuments(splitter, new OpenAIEmbeddings(), {
    indexName: "texts-embeddings",
    redisClient: redis,
    keyPrefix: "videos "
  });

  await redis.disconnect();
}

load();
