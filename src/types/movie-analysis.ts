export interface MovieAnalysis {
  analiseEstatistica: AnaliseEstatistica;
  recomendacaoFinal: RecomendacaoFinal;
}

export interface AnaliseEstatistica {
  totalVotos: number;
  totalParticipantes: number;
  distribuicaoVotos: DistribuicaoVotos[];
}

export interface DistribuicaoVotos {
  filme: string;
  votos: number;
  votantes: string[];
}

export interface RecomendacaoFinal {
  filmeRecomendado: string;
  justificativa: string;
  compatibilidadePorParticipante: CompatibilidadeParticipante[];
}

export interface CompatibilidadeParticipante {
  participante: string;
  compatibilidade: number;
  razao: string;
} 