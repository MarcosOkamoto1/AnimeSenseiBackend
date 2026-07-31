import OpenAI from "openai";

import type { Anime } from "../models/Anime.js";
import type { AnimePreferences } from "./OpenAIService.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function removeHtml(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface RankedAnime {
  id: number;
  score: number;
  reason: string;
}

export interface RankedRecommendations {
  recommendations: RankedAnime[];
}

export async function rankAnimeCandidates(
  originalPrompt: string,
  preferences: AnimePreferences,
  animes: Anime[],
): Promise<RankedRecommendations> {
  if (animes.length === 0) {
    return {
      recommendations: [],
    };
  }

  const candidates = animes.slice(0, 7).map((anime) => ({
    id: anime.id,
    title: anime.title,
    description: removeHtml(anime.description)?.slice(0, 180) ?? null,
    genres: anime.genres,
    averageScore: anime.averageScore,
  }));

  const response = await openai.responses.create({
    model: "gpt-5-mini",

    reasoning: {
      effort: "low",
    },

    instructions: `
You are an anime recommendation ranker for an application called AnimeSensei.

Your task is to rank only the anime candidates provided by the application
according to the user's original request and extracted preferences.

Rules:
- Only use anime IDs that exist in the provided candidates.
- Never invent, add, or replace anime titles.
- Do not recommend an anime only because it has a high average score.
- Compatibility with the user's request is more important than popularity.
- Exclude candidates that clearly contradict the user's request.
- Consider genres, descriptions, moods, themes, episode limits, desired tags,
  excluded genres, excluded tags, and search terms.
- Never invent plot details, relationships, or endings.
- If the available metadata is insufficient to verify an important requirement,
  assign a lower score.
- Scores must be integers from 0 to 100.
- Reasons must be concise and written in Portuguese.
- Return at most 10 recommendations.
- Order recommendations from highest score to lowest score.
`,

    input: JSON.stringify({
      originalPrompt,
      preferences,
      candidates,
    }),

    text: {
      verbosity: "low",

      format: {
        type: "json_schema",
        name: "ranked_recommendations",
        strict: true,

        schema: {
          type: "object",

          properties: {
            recommendations: {
              type: "array",
              maxItems: 10,

              items: {
                type: "object",

                properties: {
                  id: {
                    type: "integer",
                  },

                  score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                  },

                  reason: {
                    type: "string",
                  },
                },

                required: ["id", "score", "reason"],
                additionalProperties: false,
              },
            },
          },

          required: ["recommendations"],
          additionalProperties: false,
        },
      },
    },
  });

  const ranking = JSON.parse(response.output_text) as RankedRecommendations;

  const candidateIds = new Set(candidates.map((anime) => anime.id));
  const validRecommendations = ranking.recommendations
    .filter((recommendation) => candidateIds.has(recommendation.id))
    .filter((recommendation) => recommendation.score >= 60)
    .sort((first, second) => second.score - first.score)
    .slice(0, 10);

  return {
    recommendations: validRecommendations,
  };
}
