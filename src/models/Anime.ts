export interface Anime {
  id: number;
  title: string;
  description: string | null;
  episodes: number | null;
  genres: string[];
  averageScore: number | null;
  coverImage: string | null;
}
