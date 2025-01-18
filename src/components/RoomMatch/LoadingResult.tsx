import { motion } from "framer-motion";

export function LoadingResult() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 
                    dark:from-gray-900 dark:to-gray-800 
                    flex flex-col items-center justify-center p-8">
      <div className="space-y-8 text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 
                        bg-clip-text text-transparent">
            Analisando Resultados
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Estamos processando os votos e encontrando o filme perfeito para todos...
          </p>
        </motion.div>

        <div className="relative">
          <motion.div 
            animate={{ 
              rotate: 360,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent 
                       rounded-full mx-auto"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="text-2xl">🎬</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              animate={{
                width: ["0%", "100%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Calculando compatibilidade entre participantes...
          </p>
        </motion.div>
      </div>
    </div>
  );
}