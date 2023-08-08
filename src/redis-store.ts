import * as dotenv from "dotenv";
import { createClient } from "redis";

import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RedisVectorStore } from "langchain/vectorstores/redis";

dotenv.config();

export const redis = createClient({
  url: "redis://127.0.0.1:6379",
});

export const redisVectorStore = new RedisVectorStore(new OpenAIEmbeddings(), {
  indexName: "texts-embeddings",
  redisClient: redis,
  keyPrefix: "videos ",
});
