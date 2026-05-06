FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/types/package.json packages/types/package.json

RUN npm install

COPY . .

RUN npm run build --workspace=@finastra/types && npm run build --workspace=@finastra/api

ENV NODE_ENV=production
EXPOSE 4000

CMD ["sh", "-c", "cd apps/api && npx prisma generate && npx prisma db push && if [ \"$SEED_ON_BOOT\" = \"true\" ]; then npm run prisma:seed; fi && npm run start"]
