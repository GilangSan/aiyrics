import { fetchWithTimeoutAndRetry } from "@/app/utils/fetch";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  try {
    const res = await fetchWithTimeoutAndRetry(
      `http://api.deezer.com/search?limit=5&q=${query}`,
      {},
      3000,
      5
    );
    const data = await res.json();
    return new Response(JSON.stringify({ suggestions: data.data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*", // izinkan semua origin
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ suggestions: [] }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
