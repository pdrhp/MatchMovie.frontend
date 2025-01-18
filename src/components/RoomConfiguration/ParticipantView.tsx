import { Users } from "lucide-react";

function ParticipantView({
  roomCode,
  participantsCount,
}: {
  roomCode: string;
  participantsCount: number;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center space-y-8">
        <div className="relative h-32 w-32 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        </div>

        <div className="space-y-4">
          <h2
            className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 
                          bg-clip-text text-transparent"
          >
            Aguardando o host iniciar...
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            O host está configurando a sala
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full font-mono">
              {roomCode}
            </span>
            <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Users size={16} />
              {participantsCount}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-2">
          <div className="animate-bounce delay-0 h-2 w-2 bg-blue-500 rounded-full" />
          <div className="animate-bounce delay-150 h-2 w-2 bg-blue-500 rounded-full" />
          <div className="animate-bounce delay-300 h-2 w-2 bg-blue-500 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default ParticipantView;
