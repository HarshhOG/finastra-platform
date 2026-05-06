import "reflect-metadata";

import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { parseBoolean, parseCsv } from "./common/utils/env.util";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: false
  });

  const configService = app.get(ConfigService);
  const appOrigins = parseCsv(configService.get<string>("APP_ORIGINS"));
  const appOriginRegex = configService.get<string>("APP_ORIGIN_REGEX");

  app.getHttpAdapter().getInstance().set("trust proxy", 1);
  app.setGlobalPrefix("api/v1");
  app.use(
    helmet({
      crossOriginResourcePolicy: {
        policy: "cross-origin"
      },
      contentSecurityPolicy: parseBoolean(
        configService.get<string>("ENABLE_CONTENT_SECURITY_POLICY"),
        false
      )
        ? undefined
        : false
    })
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(json({ limit: "4mb" }));
  app.use(urlencoded({ extended: true, limit: "4mb" }));
  app.enableCors({
    origin(
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void
    ) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (appOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      if (appOriginRegex && new RegExp(appOriginRegex).test(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
    credentials: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = configService.get<number>("PORT", 4000);
  await app.listen(port, "0.0.0.0");
}

void bootstrap();
