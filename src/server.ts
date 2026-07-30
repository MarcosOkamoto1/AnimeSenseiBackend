import "dotenv/config";
import express from "express";
import { interpretAnimePrompt } from "./services/OpenAIService.js";

const app = express();
const port = 3000;

app.use(express.json());

app.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
  });
});

app.post("/recommendations", async (request, response) => {
  const prompt = request.body.prompt;

  try {
    response.status(200).json({
      message: "Recommendation Recevied",
      prompt: prompt,
    });
  } catch (error) {
    console.log(error);

    response.status(500).json({
      message: "Erro ao interpretar o prompt.",
    });
  }
});

app.listen(port, () => {
  console.log(`Server rodando em localhost porta ${port}`);
});
