import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module";
import { MailModule } from "../mail/mail.module";
import { PublicController } from "./public.controller";
import { PublicService } from "./public.service";

@Module({
  imports: [AuditModule, MailModule],
  controllers: [PublicController],
  providers: [PublicService],
  exports: [PublicService]
})
export class PublicModule {}
