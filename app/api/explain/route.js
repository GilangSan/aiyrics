import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

function countryCodeToName(code, locale = "en") {
  if (!code) return null;
  try {
    const dn = new Intl.DisplayNames([locale], { type: "region" });
    return dn.of(code.toUpperCase());
  } catch {
    return code;
  }
}

export async function POST(req) {
  let { lyrics, country } = await req.json();
  let getCode = countryCodeToName(country);

  const response = await client.responses.create({
    model: "openai/gpt-oss-20b",
    input: `Analyze the meaning of the following song lyrics and write the result in ${getCode}. 
Give a short and concise explanation in paragraph form only — do not use bullet points or lists. 
Focus on the main message and emotional tone of the song.

Lyrics:
${lyrics}`,
  });
  return new Response(JSON.stringify({ output: response.output_text }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*", // izinkan semua origin
    },
  });
}
