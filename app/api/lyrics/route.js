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
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      const lyrics = data.lyrics || data.data?.lyrics;
      if (lyrics) {
        return new Response(JSON.stringify({ lyrics }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
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
