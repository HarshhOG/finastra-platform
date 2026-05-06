import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        college: true
      }
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        college: true
      }
    });

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    return user;
  }

  async getProfile(id: string) {
    const user = await this.findById(id);
    const permissions = await this.prisma.rolePermission.findMany({
      where: { role: user.role },
      include: {
        permission: true
      }
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      college: user.college,
      permissions: permissions.map((binding) => binding.permission.key)
    };
  }

  async updateRefreshTokenHash(userId: string, refreshTokenHash: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash
      }
    });
  }
}
