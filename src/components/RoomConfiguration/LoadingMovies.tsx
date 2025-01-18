const LoadingMovies = () => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8 
                    bg-gradient-to-b from-gray-50 to-gray-100 
                    dark:from-gray-900 dark:to-gray-800"
    >
      <div className="w-full max-w-md space-y-8">
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        </div>

        <div className="text-center space-y-4">
          <p className="text-xl font-medium text-gray-700 dark:text-gray-300">
            Preparando filmes para o match...
          </p>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Isso pode levar alguns segundos
          </p>
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400 animate-pulse">
          <p>Selecionando os melhores filmes para você...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingMovies;
