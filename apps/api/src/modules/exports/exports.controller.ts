import { Controller, Get, Header, Param, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { ExportsService } from "./exports.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("SUPER_ADMIN", "TEAM_ADMIN")
@Controller("admin/exports")
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get(":type.csv")
  @Header("Content-Type", "text/csv")
  async exportCsv(@Param("type") type: string, @CurrentUser() user: { id: string; role: string }) {
    return this.exportsService.export(type, user);
  }
}
