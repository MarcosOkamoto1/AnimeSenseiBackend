import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AnimePreferences {
  genres: string[];
  excludedGenres: string[];
  tags: string[];
  excludedTags: string[];
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
- Distinguish AniList genres from AniList tags.
- Use genres only for broad categories such as Romance, Drama, Fantasy, Supernatural, Action, Comedy, and Slice of Life.
- Use tags for specific concepts, themes, character types, settings, or tropes.
- Convert phrases such as "cute girls" into relevant AniList-style tags such as "Cute Girls Doing Cute Things" or "Primarily Female Cast".
- Do not place specific concepts inside genres.
- Only include tags that are known AniList tags.
- Never invent tag names.
- Do not use outcome-based concepts such as "Happy Ending" as AniList tags unless they are confirmed valid.
- Put subjective or narrative outcome preferences such as happy ending, sad ending, satisfying ending, or the couple staying together inside mood or searchTerms instead of tags.
- If unsure whether a concept is a valid AniList tag, leave tags empty.
- Never claim an ending detail unless you are reasonably confident.
- Exclude candidates that clearly contradict the user's request.
- If the available metadata is insufficient, assign a lower score.
- Do not invent plot details.
- If the user requests a short anime, prioritize candidates whose episode count satisfies maxEpisodes.
- If episode count is unknown, lower the score instead of assuming the candidate is short.
- Do not return candidates with a score below 60.
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

            tags: {
              type: "array",
              items: {
                type: "string",
              },
            },

            excludedTags: {
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
            "tags",
            "excludedTags",
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
