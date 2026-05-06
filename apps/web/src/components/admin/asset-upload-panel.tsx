"use client";

import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchAdminJson } from "@/lib/api/admin-client";

type AssetRow = {
  id: string;
  url: string;
  type: string;
  altText: string | null;
  createdAt?: string;
};

export function AssetUploadPanel({
  accessToken
}: {
  accessToken: string;
}) {
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminJson<AssetRow[]>("/admin/assets", accessToken).then(setAssets).catch(() => undefined);
  }, [accessToken]);

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div>
          <h2 className="font-[var(--font-display)] text-xl font-semibold text-white">
            Media Uploads
          </h2>
          <p className="text-sm text-white/48">Upload images, videos, or documents to Cloudinary.</p>
        </div>

        <label className="flex cursor-pointer items-center justify-between rounded-[24px] border border-dashed border-white/15 bg-white/4 px-5 py-4 text-sm text-white/68">
          <span>Select file</span>
          <Upload className="h-4 w-4 text-cyan-200" />
          <input
            type="file"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) {
                return;
              }

              const formData = new FormData();
              formData.append("file", file);
              setMessage("Uploading...");

              try {
                const uploaded = await fetchAdminJson<AssetRow>("/admin/assets/upload", accessToken, {
                  method: "POST",
                  body: formData
                });
                setAssets((current) => [uploaded, ...current]);
                setMessage("Upload complete.");
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "Upload failed.");
              } finally {
                event.target.value = "";
              }
            }}
          />
        </label>

        {message ? <p className="text-sm text-cyan-100/75">{message}</p> : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {assets.map((asset) => (
            <div key={asset.id} className="rounded-[22px] border border-white/10 bg-white/4 p-4">
              <div className="aspect-[4/3] rounded-[18px] bg-slate-950/60 p-2">
                {asset.type === "IMAGE" ? (
                  <div
                    className="h-full w-full rounded-[14px] bg-cover bg-center"
                    style={{ backgroundImage: `url(${asset.url})` }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-white/42">
                    {asset.type}
                  </div>
                )}
              </div>
              <p className="mt-3 truncate text-sm text-white/72">{asset.altText ?? asset.url}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
