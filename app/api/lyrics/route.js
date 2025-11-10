import { fetchWithTimeoutAndRetry } from "@/app/utils/fetch";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title");
  const artist = searchParams.get("artist");

  const endpoints = [
    `https://api.lyrics.ovh/v1/${artist}/${title}`,
    `https://lyrics.lewdhutao.my.eu.org/v2/musixmatch/lyrics?title=${title}&artist=${artist}`,
    `https://lyrics.lewdhutao.my.eu.org/v2/youtube/lyrics?title=${title}&artist=${artist}`,
  ];

  for (const url of endpoints) {
    try {
      console.log("hit api!");
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
    } catch (e) {
      continue;
    }
  }

  return new Response(JSON.stringify({ lyrics: "Lyrics not found." }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}
