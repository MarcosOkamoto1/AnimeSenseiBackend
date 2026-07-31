import type { Anime } from "../models/Anime.js";
import type { AnimePreferences } from "./OpenAIService.js";

const ANILIST_URL = "https://graphql.anilist.co";

interface AniListResponse {
  data: {
    Page: {
      media: AniListAnime[];
    };
  };
}

interface AniListAnime {
  id: number;

  title: {
    romaji: string;
  };

  description: string | null;
  episode: number | null;
  genres: string[];
  averageScore: number | null;

  coverImage: {
    large: string | null;
  } | null;

  relations: {
    edges: {
      relationType: string | null;
    }[];
  };
}

export async function searchAnimes(
  preferences: AnimePreferences,
): Promise<Anime[]> {
  const query = `
    query (
      $genres: [String]
      $tags: [String]
      $excludedGenres: [String]
      $excludedTags: [String]
      $episodesLesser: Int
    ) {
      Page(page: 1, perPage: 30) {
        media(
          type: ANIME
          genre_in: $genres
          genre_not_in: $excludedGenres
          tag_in: $tags
          tag_not_in: $excludedTags
          episodes_lesser: $episodesLesser
          minimumTagRank: 30
          sort: [SCORE_DESC, POPULARITY_DESC]
        ) {
          id

          title {
            romaji
          }

          description
          episodes
          genres
          averageScore

          coverImage {
            large
          }

          relations {
            edges {
              relationType
            }
          }
        }
      }
    }
  `;

  const variables = {
    genres: preferences.genres.length > 0 ? preferences.genres : undefined,

    tags: preferences.tags.length > 0 ? preferences.tags : undefined,

    excludedGenres:
      preferences.excludedGenres.length > 0
        ? preferences.excludedGenres
        : undefined,

    excludedTags:
      preferences.excludedTags.length > 0
        ? preferences.excludedTags
        : undefined,

    episodesLesser:
      preferences.maxEpisodes !== null
        ? preferences.maxEpisodes + 1
        : undefined,
  };

  const response = await fetch(ANILIST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`AniList request failed: ${response.status}`);
  }

  const result = (await response.json()) as AniListResponse;

  const originalAnimes = result.data.Page.media.filter((anime) => {
    const hasPrequel = anime.relations.edges.some(
      (relation) => relation.relationType === "PREQUEL",
    );

    return !hasPrequel;
  });

  return originalAnimes.slice(0, 10).map((anime) => ({
    id: anime.id,
    title: anime.title.romaji,
    description: anime.description,
    episodes: anime.episode,
    genres: anime.genres,
    averageScore: anime.averageScore,
    coverImage: anime.coverImage?.large ?? null,
  }));
}
