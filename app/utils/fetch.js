import https from 'https'

const agent = new https.Agent({ rejectUnauthorized: false });

export async function fetchWithTimeoutAndRetry(url, options = {}, timeout = 5000, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal, agent });
      clearTimeout(id);

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response;
    } catch (err) {
      clearTimeout(id);

      if (err.name === "AbortError") {
        console.warn(`⏱️ Timeout pada percobaan ${attempt}/${retries}`);
      } else {
        console.warn(`⚠️ Error pada percobaan ${attempt}/${retries}:`, err.message);
      }

      if (attempt < retries) {
        console.log("Retry..");
        await new Promise(res => setTimeout(res, 1000));
        continue;
      }
      throw err;
    }
  }
}