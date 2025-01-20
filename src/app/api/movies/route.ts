import { NextResponse } from 'next/server';

const TMDB_TOKEN = process.env.TMDB_TOKEN;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (!category) {
    return NextResponse.json({ error: 'Categoria é obrigatória' }, { status: 400 });
  }

  try {
    const genreMap: Record<string, number> = {
      'Ação': 28,
      'Aventura': 12,
      'Animação': 16,
      'Comédia': 35,
      'Crime': 80,
      'Documentário': 99,
      'Drama': 18,
      'Família': 10751,
      'Fantasia': 14,
      'Ficção Científica': 878,
      'História': 36,
      'Terror': 27,
      'Música': 10402,
      'Mistério': 9648,
      'Romance': 10749,
      'Suspense': 53,
      'Guerra': 10752,
      'Western': 37
    };

    const genreId = genreMap[category];
    
    async function fetchMovies(genreId: number, criteria: {
      voteCount: number,
      voteAverage: number,
      startYear: number,
      languages: string
    }) {
      const randomPage = Math.floor(Math.random() * 20) + 1;
      const sortOptions = [
        'popularity.desc',
        'vote_average.desc',
        'primary_release_date.desc',
        'revenue.desc'
      ];
      const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)];

      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?` + 
        `with_genres=${genreId}&` +
        `sort_by=${randomSort}&` +
        `vote_count.gte=${criteria.voteCount}&` + 
        `vote_average.gte=${criteria.voteAverage}&` + 
        `primary_release_date.gte=${criteria.startYear}-01-01&` +
        `primary_release_date.lte=2025-12-31&` +
        `with_original_language=${criteria.languages}&` +
        `page=${randomPage}&` + 
        `language=pt-BR`,
        {
          headers: {
            'Authorization': `Bearer ${TMDB_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return await response.json();
    }

    let data = await fetchMovies(genreId, {
      voteCount: 1000,
      voteAverage: 7.0,
      startYear: 2000,
      languages: 'en|pt|es|fr'
    });

    if (!data.results || data.results.length < 10) {
      data = await fetchMovies(genreId, {
        voteCount: 500,
        voteAverage: 6.0,
        startYear: 1990,
        languages: 'en|pt|es|fr|de|it'
      });
    }

    if (!data.results || data.results.length < 10) {
      data = await fetchMovies(genreId, {
        voteCount: 100,
        voteAverage: 5.0,
        startYear: 1970,
        languages: 'en|pt|es|fr|de|it|ja|ko'
      });
    }

    if (!data.results || data.results.length === 0) {
      throw new Error(`Não foram encontrados filmes para a categoria ${category}`);
    }

    const shuffledMovies = data.results
      .sort(() => Math.random() - 0.5)
      .slice(0, 10)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        posterPath: movie.poster_path,
        releaseDate: movie.release_date,
        voteAverage: movie.vote_average,
        genres: [category]
      }));

    return NextResponse.json(shuffledMovies);

  } catch (error) {
    console.error('Erro ao buscar filmes:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar filmes do TMDB' }, 
      { status: 500 }
    );
  }
} 