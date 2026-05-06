import type { VercelRequest, VercelResponse } from "@vercel/node";
import { renderToString } from "react-dom/server";
import { Player } from "../components/NowPlaying";
import { nowPlaying } from "../utils/spotify";

export default async function (req: VercelRequest, res: VercelResponse) {
  try {
    const {
      item = {} as any,
      is_playing: isPlaying = false,
      progress_ms: progress = 0,
    } = await nowPlaying();

    if (typeof req.query.open !== "undefined") {
      if (item && item.external_urls) {
        res.writeHead(302, { Location: item.external_urls.spotify });
        return res.end();
      }
      return res.status(200).end();
    }

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate");

    const { duration_ms: duration, name: track } = item;
    const { images = [] } = item.album || {};

    const cover = images[images.length - 1]?.url;
    let coverImg: string | null = null;
    if (cover) {
      const buff = await (await fetch(cover)).arrayBuffer();
      coverImg = `data:image/jpeg;base64,${Buffer.from(buff).toString("base64")}`;
    }

    const artist = (item.artists || []).map(({ name }: any) => name).join(", ");
    const text = renderToString(
      Player({ cover: coverImg, artist, track, isPlaying, progress, duration })
    );
    return res.status(200).send(text);
  } catch (e) {
    console.error("now-playing error:", e);
    return res.status(500).send(`Error: ${e}`);
  }
}
