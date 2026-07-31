import "dotenv/config";
import express from "express";
import { interpretAnimePrompt } from "./services/OpenAIService.js";
import { searchAnimes } from "./services/AniListService.js";
import { rankAnimeCandidates } from "./services/RecommendationService.js";

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
    console.time("Interpretation");
    const preferences = await interpretAnimePrompt(prompt);
    console.timeEnd("Interpretation");

    console.time("AniList");
    const animes = await searchAnimes(preferences);
    console.timeEnd("AniList");

    console.time("Ranking");
    const rank = await rankAnimeCandidates(prompt, preferences, animes);
    console.timeEnd("Ranking");

    const recommendations = rank.recommendations
      .map((rankedAnime) => {
        const anime = animes.find((anime) => anime.id === rankedAnime.id);

        if (!anime) {
          return null;
        }

        return {
          ...anime,
          recommendationScore: rankedAnime.score,
          reason: rankedAnime.reason,
        };
      })
      .filter((anime) => anime !== null);

    response.status(200).json({
      preferences,
      recommendations,
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
