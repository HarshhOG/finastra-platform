import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards
} from "@nestjs/common";
import type { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { LoginDto } from "./dto/login.dto";
import { LogoutDto } from "./dto/logout.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { AuthService } from "./auth.service";
import { parseBoolean } from "../../common/utils/env.util";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  private get refreshCookieName() {
    return this.configService.get<string>("AUTH_COOKIE_NAME", "finastra_refresh");
  }

  private writeRefreshCookie(response: Response, refreshToken: string) {
    if (!parseBoolean(this.configService.get<string>("AUTH_ENABLE_REFRESH_COOKIE"), false)) {
      return;
    }

    response.cookie(this.refreshCookieName, refreshToken, {
      httpOnly: true,
      sameSite: this.configService.get<"lax" | "strict" | "none">("AUTH_COOKIE_SAME_SITE", "lax"),
      secure: parseBoolean(
        this.configService.get<string>("AUTH_COOKIE_SECURE"),
        process.env.NODE_ENV === "production"
      ),
      domain: this.configService.get<string>("AUTH_COOKIE_DOMAIN") || undefined,
      maxAge: 14 * 24 * 60 * 60 * 1000
    });
  }

  private clearRefreshCookie(response: Response) {
    if (!parseBoolean(this.configService.get<string>("AUTH_ENABLE_REFRESH_COOKIE"), false)) {
      return;
    }

    response.clearCookie(this.refreshCookieName, {
      httpOnly: true,
      sameSite: this.configService.get<"lax" | "strict" | "none">("AUTH_COOKIE_SAME_SITE", "lax"),
      secure: parseBoolean(
        this.configService.get<string>("AUTH_COOKIE_SECURE"),
        process.env.NODE_ENV === "production"
      ),
      domain: this.configService.get<string>("AUTH_COOKIE_DOMAIN") || undefined
    });
  }

  @Public()
  @Post("login")
  async login(
    @Body() body: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.login(body, request.ip);
    this.writeRefreshCookie(response, result.refreshToken);

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user
    };
  }

  @Public()
  @HttpCode(200)
  @Post("refresh")
  async refresh(
    @Body() body: RefreshTokenDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const refreshToken = body.refreshToken ?? request.cookies?.[this.refreshCookieName];
    if (!refreshToken) {
      return {
        success: false
      };
    }

    const userId = this.authService.parseRefreshSubject(refreshToken);
    const result = await this.authService.refresh(userId, refreshToken, request.ip);

    this.writeRefreshCookie(response, result.refreshToken);

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user
    };
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post("logout")
  async logout(
    @Body() _body: LogoutDto,
    @CurrentUser() user: { id: string },
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    this.clearRefreshCookie(response);
    return this.authService.logout(user.id, request.ip);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async profile(@CurrentUser() user: { id: string }) {
    return this.authService.getProfile(user.id);
  }
}
