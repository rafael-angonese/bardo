import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import {
  RetrievalQAChain,
  ConversationalRetrievalQAChain,
} from "langchain/chains";
import { redis, redisVectorStore } from "./redis-store";

const openAiChat = new ChatOpenAI({
  openAIApiKey: "...",
  modelName: "gpt-3.5-turbo",
  temperature: 0.3,
});

const prompt = new PromptTemplate({
  template: `
    Você responde perguntas sobre programação.
    O usuário está assistindo um curso com várias aulas.
    Use o conteúdo das transcrições das aulas abaixo para responder a pergunta do usuário.
    Se a resposta não for encontrada nas transcrições, responda que você não sabe.
    Se possível, inclua exemplos de código usando Typescript.

    Transcrições:
    {context}

    Pergunta
    {question}
    
    `.trim(),
  inputVariables: ["context", "question"],
});

// LLM -> Large Language Model

const chain = RetrievalQAChain.fromLLM(
  openAiChat,
  redisVectorStore.asRetriever(3),
  {
    prompt,
    returnSourceDocuments: true,
    verbose: true,
  }
);

async function gpt() {
  await redis.connect();

  const response = await chain.call({
    query: "Me Explique o conceito de Aggregate Root no DDD",
  });

  console.log(response);

  await redis.disconnect();
}

gpt();
