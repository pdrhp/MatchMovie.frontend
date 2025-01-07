import { NextResponse } from 'next/server';

const TMDB_TOKEN = process.env.TMDB_TOKEN;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (!category) {
    return NextResponse.json({ error: 'Categoria é obrigatória' }, { status: 400 });
  }

  console.log('Buscando filmes para a categoria:', category);

  try {
    // Mapeia as categorias do nosso app para os IDs do TMDB
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
    
    // Busca filmes populares do gênero específico
    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie?` + 
      `with_genres=${genreId}&` +
      `sort_by=popularity.desc&` +
      `vote_count.gte=100&` + // Filmes com pelo menos 100 votos
      `vote_average.gte=6.0&` + // Nota média mínima de 6
      `language=pt-BR&` +
      `page=1`, // Primeira página de resultados
      {
        headers: {
          'Authorization': `Bearer ${TMDB_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const movies = data.results.slice(0, 10).map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
      voteAverage: movie.vote_average,
      genres: [category]
    }));

    return NextResponse.json(movies);

  } catch (error) {
    console.error('Erro ao buscar filmes:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar filmes do TMDB' }, 
      { status: 500 }
    );
  }
} 