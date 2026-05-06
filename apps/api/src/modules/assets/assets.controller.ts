import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AssetsService } from "./assets.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("SUPER_ADMIN", "TEAM_ADMIN")
@Controller("admin/assets")
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  listRecent() {
    return this.assetsService.listRecent();
  }

  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: {
        fileSize: 8 * 1024 * 1024
      }
    })
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: string }
  ) {
    return this.assetsService.uploadFile(file, user.id);
  }
}
