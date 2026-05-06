import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { ReviewApprovalDto } from "./dto/review-approval.dto";
import { ApprovalsService } from "./approvals.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("SUPER_ADMIN", "TEAM_ADMIN")
@Controller("admin/approvals")
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get()
  getApprovals(@CurrentUser() user: { id: string; role: string }) {
    return this.approvalsService.listApprovals(user);
  }

  @Roles("SUPER_ADMIN")
  @Post(":id/approve")
  approve(
    @Param("id") approvalId: string,
    @Body() body: ReviewApprovalDto,
    @CurrentUser() user: { id: string }
  ) {
    return this.approvalsService.approve(approvalId, user.id, body.notes);
  }

  @Roles("SUPER_ADMIN")
  @Post(":id/reject")
  reject(
    @Param("id") approvalId: string,
    @Body() body: ReviewApprovalDto,
    @CurrentUser() user: { id: string }
  ) {
    return this.approvalsService.reject(approvalId, user.id, body.notes);
  }
}
