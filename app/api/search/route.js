export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  try {
    const res = await fetch(`https://api.lyrics.ovh/suggest/${query}`);
    const data = await res.json();
    return new Response(JSON.stringify({ suggestions: data.data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ suggestions: [] }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}