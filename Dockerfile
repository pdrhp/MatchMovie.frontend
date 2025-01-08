# Imagem base
FROM node:20-alpine AS base

# Dependências necessárias
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

# Fase de dependências
FROM base AS deps
WORKDIR /app

# Copia arquivos de dependência
COPY package.json pnpm-lock.yaml ./

# Instala dependências com cache limpo
RUN pnpm install --frozen-lockfile

# Fase de builder
FROM base AS builder
WORKDIR /app

# Copia dependências e arquivos do projeto
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_WS_URL
ARG TMDB_API_KEY
ARG TMDB_TOKEN

ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV TMDB_API_KEY=$TMDB_API_KEY
ENV TMDB_TOKEN=$TMDB_TOKEN

# Configuração do Next.js
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build da aplicação
RUN pnpm build

# Fase de runner
FROM base AS runner
WORKDIR /app

# Variáveis de ambiente para produção
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Cria usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Define permissões para o diretório
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Define usuário não-root
USER nextjs

# Copia arquivos necessários
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Expõe porta
EXPOSE 3000

# Define variáveis de ambiente em runtime
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Comando para iniciar
CMD ["node", "server.js"]