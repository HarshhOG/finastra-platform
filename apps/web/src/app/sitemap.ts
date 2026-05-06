import type { MetadataRoute } from "next";
import { buildAbsoluteUrl, fetchPublicJson } from "@/lib/api/client";
import type { EventCollectionPayload } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = buildAbsoluteUrl("");
  const events = await fetchPublicJson<EventCollectionPayload>("/public/events", {
    revalidate: 300
  }).catch(() => []);

  return [
    "",
    "/events",
    "/college-register",
    "/cr-register",
    "/team-pre-registration",
    "/organising-team",
    "/contact"
  ]
    .map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date()
    }))
    .concat(
      events.map((event) => ({
        url: `${base}/events/${event.slug}`,
        lastModified: new Date()
      }))
    );
}
