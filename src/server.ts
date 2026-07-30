import "dotenv/config";
import express from "express";
import { interpretAnimePrompt } from "./services/OpenAIService.js";
import { searchAnimes } from "./services/AniListService.js";

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
    const preferences = await interpretAnimePrompt(prompt);
    const animes = await searchAnimes(preferences);

    response.status(200).json({
      preferences,
      animes,
    });
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: "Erro ao gerar recomendações.",
    });
  }
});

app.listen(port, () => {
  console.log(`Server rodando em localhost porta ${port}`);
});
