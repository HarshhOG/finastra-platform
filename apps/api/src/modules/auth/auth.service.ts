import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { AuditService } from "../audit/audit.service";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService
  ) {}

  private async signTokens(user: { id: string; email: string; role: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
        expiresIn: this.configService.get<string>("ACCESS_TOKEN_TTL", "20m") as never
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.configService.get<string>("REFRESH_TOKEN_TTL", "14d") as never
      })
    ]);

    return {
      accessToken,
      refreshToken
    };
  }

  private async persistRefreshToken(userId: string, refreshToken: string) {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshTokenHash(userId, refreshTokenHash);
  }

  async login(dto: LoginDto, ipAddress?: string) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user?.passwordHash) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    const tokens = await this.signTokens({
      id: user.id,
      email: user.email,
      role: user.role
    });

    await Promise.all([
      this.persistRefreshToken(user.id, tokens.refreshToken),
      this.auditService.log({
        actorId: user.id,
        action: "AUTH_LOGIN",
        entityType: "User",
        entityId: user.id,
        ipAddress,
        metadata: { email: user.email }
      })
    ]);

    return {
      ...tokens,
      user: await this.usersService.getProfile(user.id)
    };
  }

  async refresh(userId: string, refreshToken: string, ipAddress?: string) {
    const user = await this.usersService.findById(userId);
    if (!user.refreshTokenHash) {
      throw new ForbiddenException("Refresh session is no longer valid.");
    }

    const tokenMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!tokenMatches) {
      throw new ForbiddenException("Refresh session is no longer valid.");
    }

    const tokens = await this.signTokens({
      id: user.id,
      email: user.email,
      role: user.role
    });

    await Promise.all([
      this.persistRefreshToken(user.id, tokens.refreshToken),
      this.auditService.log({
        actorId: user.id,
        action: "AUTH_REFRESH",
        entityType: "User",
        entityId: user.id,
        ipAddress
      })
    ]);

    return {
      ...tokens,
      user: await this.usersService.getProfile(user.id)
    };
  }

  async logout(userId: string, ipAddress?: string) {
    await Promise.all([
      this.usersService.updateRefreshTokenHash(userId, null),
      this.auditService.log({
        actorId: userId,
        action: "AUTH_LOGOUT",
        entityType: "User",
        entityId: userId,
        ipAddress
      })
    ]);

    return {
      success: true
    };
  }

  getProfile(userId: string) {
    return this.usersService.getProfile(userId);
  }

  parseRefreshSubject(token: string) {
    try {
      const payload = this.jwtService.verify<{ sub: string }>(token, {
        secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET")
      });

      return payload.sub;
    } catch {
      throw new UnauthorizedException("Refresh token is invalid.");
    }
  }
}
