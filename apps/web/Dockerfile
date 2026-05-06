FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/types/package.json packages/types/package.json

RUN npm install

COPY . .

ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
ARG API_INTERNAL_URL=http://api:4000/api/v1
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV API_INTERNAL_URL=${API_INTERNAL_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}

RUN npm run build --workspace=@finastra/types && npm run build --workspace=@finastra/web

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=@finastra/web"]
