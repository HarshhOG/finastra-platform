import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { type AssetType } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>("CLOUDINARY_CLOUD_NAME"),
      api_key: this.configService.get<string>("CLOUDINARY_API_KEY"),
      api_secret: this.configService.get<string>("CLOUDINARY_API_SECRET"),
      secure: true
    });
  }

  private ensureCloudinaryConfigured() {
    if (
      !this.configService.get<string>("CLOUDINARY_CLOUD_NAME") ||
      !this.configService.get<string>("CLOUDINARY_API_KEY") ||
      !this.configService.get<string>("CLOUDINARY_API_SECRET")
    ) {
      throw new BadRequestException("Cloudinary is not configured.");
    }
  }

  private inferAssetType(mimeType: string): AssetType {
    if (mimeType.startsWith("image/")) {
      return "IMAGE";
    }

    if (mimeType.startsWith("video/")) {
      return "VIDEO";
    }

    return "DOCUMENT";
  }

  async uploadFile(file: Express.Multer.File, actorId?: string) {
    this.ensureCloudinaryConfigured();

    if (!file) {
      throw new BadRequestException("No file was uploaded.");
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
      "application/pdf",
      "video/mp4"
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException("Unsupported file type.");
    }

    const type = this.inferAssetType(file.mimetype);
    const folder = this.configService.get<string>("CLOUDINARY_UPLOAD_FOLDER", "finastra");

    const uploaded = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: (
            type === "DOCUMENT" ? "raw" : type === "VIDEO" ? "video" : "image"
          ) as "raw" | "image" | "video",
          use_filename: true,
          unique_filename: true
        },
        (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary upload failed."));
            return;
          }

          resolve(result);
        }
      );

      stream.end(file.buffer);
    });

    return this.prisma.asset.create({
      data: {
        storageKey: uploaded.public_id,
        url: uploaded.secure_url,
        type,
        altText: file.originalname,
        createdById: actorId ?? null
      }
    });
  }

  async listRecent() {
    const assets = await this.prisma.asset.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: 24
    });

    return assets.map((asset) => ({
      id: asset.id,
      url: asset.url,
      type: asset.type,
      altText: asset.altText,
      createdAt: asset.createdAt.toISOString()
    }));
  }
}
