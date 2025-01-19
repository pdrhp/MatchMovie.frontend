import { RoomSettings } from "@/types/room";
import {
  ClipboardCopy,
  Link,
  PlayCircle,
  Settings,
  Timer,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const categories = [
  "Ação",
  "Aventura",
  "Animação",
  "Biografia",
  "Comédia",
  "Crime",
  "Documentário",
  "Drama",
  "Família",
  "Fantasia",
  "Ficção Científica",
  "Guerra",
  "História",
  "Horror",
  "Mistério",
  "Musical",
  "Romance",
  "Suspense",
  "Terror",
  "Western",
];

function HostView({
  roomCode,
  participantsCount,
  settings,
  onSaveSettings,
  onStartMatch,
  error,
}: {
  roomCode: string;
  participantsCount: number;
  settings: RoomSettings;
  onSaveSettings: (roomCode: string, settings: RoomSettings) => Promise<void>;
  onStartMatch: () => Promise<void>;
  error: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [localSettings, setLocalSettings] = useState<RoomSettings>({
    categories: settings.categories,
    roundDurationInSeconds: settings.roundDurationInSeconds || 60,
    maxParticipants: settings.maxParticipants,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    const isChanged = 
      JSON.stringify(localSettings) !== JSON.stringify(settings);
    setHasUnsavedChanges(isChanged);
  }, [localSettings, settings]);

  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(categoryFilter.toLowerCase())
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSettings = async () => {
    await onSaveSettings(roomCode, localSettings);
    setHasUnsavedChanges(false);
  };

  const handleStartMatch = async () => {
    if (!localSettings.categories.length) {
      toast.error("Selecione categorias", {
        description:
          "Você precisa selecionar pelo menos uma categoria para iniciar o match.",
      });
      return;
    }

    if (hasUnsavedChanges) {
      toast.error("Salve as configurações", {
        description:
          "Você precisa salvar as configurações antes de iniciar o match.",
      });
      return;
    }

    onStartMatch();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8 max-h-[90vh] flex flex-col">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 pb-6 border-b dark:border-gray-700 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Sua Sala
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="flex gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-700 
                           rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Copiar código"
                >
                  <span className="font-mono font-bold text-sm">{roomCode}</span>
                  <ClipboardCopy size={14} />
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/room/${roomCode}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-700 
                           rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Copiar link da sala"
                >
                  <span className="font-mono font-bold text-sm">URL</span>
                  <Link size={14} />
                </button>
              </div>

              {copied && (
                <span className="text-xs sm:text-sm text-green-500 animate-fade-in">
                  Copiado!
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full w-fit">
            <Users size={16} className="text-gray-500" />
            <span className="font-medium text-sm sm:text-base">{participantsCount}</span>
          </div>
        </div>

        {error && (
          <div
            className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-lg
                           border border-red-200 dark:border-red-800"
          >
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-8 overflow-y-auto flex-1 pr-2">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="text-blue-500" size={24} />
              <h2 className="text-xl font-semibold">
                Configurações da Partida
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="relative">
                <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  <Timer size={16} className="text-blue-500" />
                  Duração da Rodada
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={30}
                    max={300}
                    value={localSettings.roundDurationInSeconds}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setLocalSettings({
                        ...localSettings,
                        roundDurationInSeconds: value > 0 ? value : "",
                      });
                    }}
                    className="w-full p-3 pl-4 pr-16 rounded-xl border border-gray-200 
                               dark:border-gray-600 dark:bg-gray-800 
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               transition-all duration-200 ease-in-out
                               text-lg font-medium
                               placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <span
                    className="absolute right-4 top-1/2 -translate-y-1/2 
                                   text-sm text-gray-500 dark:text-gray-400"
                  >
                    seg
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                  Entre 30 e 300 segundos
                </span>
              </div>

              <div className="relative">
                <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  <Users size={16} className="text-blue-500" />
                  Máximo de Participantes
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={2}
                    max={10}
                    value={localSettings.maxParticipants}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setLocalSettings({
                        ...localSettings,
                        maxParticipants: value > 0 ? value : "",
                      });
                    }}
                    className="w-full p-3 pl-4 pr-16 rounded-xl border border-gray-200 
                               dark:border-gray-600 dark:bg-gray-800 
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               transition-all duration-200 ease-in-out
                               text-lg font-medium
                               placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <span
                    className="absolute right-4 top-1/2 -translate-y-1/2 
                                   text-sm text-gray-500 dark:text-gray-400"
                  >
                    pessoas
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
              <span className="p-1.5 bg-blue-500 rounded-lg text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                  <polyline points="17 2 12 7 7 2"></polyline>
                </svg>
              </span>
              Categorias de Filmes
            </h3>

            <div className="mb-4 relative">
              <input
                type="text"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                placeholder="Buscar categorias..."
                className="w-full p-3 pl-10 rounded-xl border border-gray-200 
                           dark:border-gray-600 dark:bg-gray-800 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-200 ease-in-out"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              {categoryFilter && (
                <button
                  onClick={() => setCategoryFilter("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 
                             hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>

            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              {localSettings.categories.length} categorias selecionadas
            </div>

            <div className="max-h-[40vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {filteredCategories.map((category) => (
                  <label
                    key={category}
                    className={`group relative flex items-center p-3 rounded-lg cursor-pointer
                                 transition-all duration-200 ease-in-out text-sm
                                 ${
                                   localSettings.categories.includes(category)
                                     ? "bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500 shadow-md"
                                     : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700"
                                 }`}
                  >
                    <input
                      type="checkbox"
                      checked={localSettings.categories.includes(category)}
                      onChange={(e) => {
                        const newCategories = e.target.checked
                          ? [...localSettings.categories, category]
                          : localSettings.categories.filter(
                              (c) => c !== category
                            );
                        setLocalSettings({
                          ...localSettings,
                          categories: newCategories,
                        });
                      }}
                      className="hidden"
                    />
                    <div
                      className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center
                                    transition-all duration-200 ease-in-out
                                    ${
                                      localSettings.categories.includes(
                                        category
                                      )
                                        ? "bg-blue-500 border-blue-500"
                                        : "border-gray-300 dark:border-gray-500 group-hover:border-blue-400"
                                    }`}
                    >
                      {localSettings.categories.includes(category) && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`font-medium ${
                        localSettings.categories.includes(category)
                          ? "text-blue-700 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {category}
                    </span>
                  </label>
                ))}
              </div>

              {filteredCategories.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Nenhuma categoria encontrada para &quot;{categoryFilter}&quot;
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 pt-4 mt-8 border-t dark:border-gray-700">
          <button
            onClick={handleSaveSettings}
            disabled={!hasUnsavedChanges}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-white font-medium text-sm
                      ${hasUnsavedChanges 
                        ? 'bg-blue-500 hover:bg-blue-600' 
                        : 'bg-gray-400 cursor-not-allowed'} 
                      transition-colors w-full sm:w-[45%]`}
          >
            Salvar
          </button>
          <button
            onClick={handleStartMatch}
            disabled={localSettings.categories.length === 0}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl
                      flex items-center justify-center gap-2
                      font-medium transition-colors text-sm
                      ${localSettings.categories.length === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : hasUnsavedChanges
                        ? "bg-green-500/50 hover:bg-green-600/50"
                        : "bg-green-500 hover:bg-green-600"} 
                      text-white relative w-full sm:w-[55%]`}
          >
            <PlayCircle size={16} />
            <span>Iniciar Match</span>
            {hasUnsavedChanges && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HostView;
