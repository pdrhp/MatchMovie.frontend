# Imagem base
FROM node:20-alpine AS base

# Dependências para o sharp (processamento de imagens)
RUN apk add --no-cache libc6-compat

# Fase de instalação de dependências
FROM base AS deps
WORKDIR /app

# Copia os arquivos de configuração
COPY package.json package-lock.json* ./

# Instala as dependências
RUN npm ci

# Fase de build
FROM base AS builder
WORKDIR /app

# Copia as dependências da fase anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variáveis de ambiente para o build
ARG TMDB_TOKEN
ENV TMDB_TOKEN=$TMDB_TOKEN

# Build da aplicação
RUN npm run build

# Fase de produção
FROM base AS runner
WORKDIR /app

# Define o usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copia os arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Variáveis de ambiente para produção
ENV NODE_ENV=production
ENV PORT=3000

# Expõe a porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "server.js"]