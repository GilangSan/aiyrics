import { fetchWithTimeoutAndRetry } from "@/app/utils/fetch";
import { findLyrics } from "@/app/utils/findLyrics";
import { getLyrics } from "genius-lyrics-api";

function cleanLyrics(raw) {
  const start = raw.search(/\[(Intro|Verse|Chorus|Bridge|Outro|Hook|Refrain|Part|Lirik)[^\]]*\]/i);
  if (start !== -1) {
    return raw.slice(start).trim();
  }
  return raw.trim();
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title");
  const artist = searchParams.get("artist");

  const endpoints = [
    `system`,
    `genius`,
    `https://lyrics.lewdhutao.my.eu.org/v2/musixmatch/lyrics?title=${title}&artist=${artist}`,
    `https://lyrics.lewdhutao.my.eu.org/v2/youtube/lyrics?title=${title}&artist=${artist}`,
  ];

  let i = 0;

  for (const url of endpoints) {
    try {
      console.log("hit api!");
      if (url == "genius") {
        console.log("genius hit");
        const options = {
          apiKey: process.env.GENIUS_ACCESS_TOKEN || "",
          title,
          artist,
          optimizeQuery: true,
        };
        let res = await getLyrics(options);
        let lyrics = cleanLyrics(res)
        if (lyrics) {
          return new Response(JSON.stringify({ lyrics: lyrics }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
              "Access-Control-Allow-Origin": "*", // izinkan semua origin
            },
          });
        }
      } else if (url == "system") {
        console.log("system hit");
        let res = await findLyrics(title, artist);
        let lyrics = res.replace(/(?=\[)/g, '\n')
        if (lyrics) {
          return new Response(JSON.stringify({ lyrics: lyrics }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
              "Access-Control-Allow-Origin": "*", // izinkan semua origin
            },
          });
        }
        i++;
      } else {
        console.log("other hit");
        const res = await fetchWithTimeoutAndRetry(
          url,
          { cache: "no-store" },
          3000,
          1
        );
        if (!res.ok) continue;
        const data = await res.json();
        const lyrics = data.lyrics || data.data?.lyrics;
        if (lyrics) {
          return new Response(JSON.stringify({ lyrics }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
              "Access-Control-Allow-Origin": "*", // izinkan semua origin
            },
          });
        }
        i++;
      }
    } catch (e) {
      i++;
      continue;
    }
  }

  return new Response(JSON.stringify({ lyrics: "Lyrics not found." }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}
