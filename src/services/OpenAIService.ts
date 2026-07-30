import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AnimePreferences {
  genres: string[];
  excludedGenres: string[];
  mood: string[];
  maxEpisodes: number | null;
  searchTerms: string[];
}

export async function interpretAnimePrompt(
  prompt: string,
): Promise<AnimePreferences> {
  const response = await openai.responses.create({
    model: "gpt-5-mini",

    instructions: `
You are an anime search-query interpreter for AnimeSensei.

Extract precise preferences that can later be used to search the AniList API.

Rules:
- Do not recommend anime titles.
- Do not explain your reasoning.
- Preserve the user's intent.
- Translate extracted values into English.
- Prefer official AniList genre names.
- Do not invent preferences.
- Use empty arrays when information is missing.
- Use null when no maximum episode count is specified.
- Interpret "short", "curto", "few episodes", or equivalent expressions as maxEpisodes: 13.
- Interpret "medium length" or equivalent expressions as maxEpisodes: 26.
- Only use episode limits explicitly stated or clearly implied by the user.
`,

    input: prompt,

    text: {
      format: {
        type: "json_schema",
        name: "anime_preferences",
        strict: true,
        schema: {
          type: "object",
          properties: {
            genres: {
              type: "array",
              items: {
                type: "string",
              },
            },
            excludedGenres: {
              type: "array",
              items: {
                type: "string",
              },
            },
            mood: {
              type: "array",
              items: {
                type: "string",
              },
            },
            maxEpisodes: {
              type: ["integer", "null"],
            },
            searchTerms: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
          required: [
            "genres",
            "excludedGenres",
            "mood",
            "maxEpisodes",
            "searchTerms",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  return JSON.parse(response.output_text) as AnimePreferences;
}
