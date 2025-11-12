import fetch from "node-fetch";
import * as cheerio from "cheerio";
import _ from "lodash";
import levenshtein from "fast-levenshtein";

export async function findLyrics(title, artistName) {
  const textln = (html) => {
  html.find("br").replaceWith("\n");
  html.find("script").remove();
  html.find("#video-musictory").remove();
  html.find("strong").remove();
  let text = _.trim(html.text());
  text = text.replace(/\r\n\n/g, "\n");
  text = text.replace(/\t/g, "");
  text = text.replace(/\n\r\n/g, "\n");
  text = text.replace(/ +/g, " ");
  text = text.replace(/\n /g, "\n");

  text = text
    .split("\n")
    .filter(
      (line) =>
        !/^paroles de la chanson.+par.+/i.test(line.trim()) && line.trim() !== ""
    )
    .join("\n")
    .trim();

  return text;
};


  const lyricsUrl = (t) => _.kebabCase(_.trim(_.toLower(_.deburr(t))));
  const lyricsManiaUrl = (t) => _.snakeCase(_.trim(_.toLower(_.deburr(t))));
  const lyricsManiaUrlAlt = (t) =>
    _.trim(_.toLower(t)).replace("'", "").replace(/ /g, "_").replace(/_+/g, "_");

  const loadHtml = async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Bad response");
      const body = await res.text();
      return cheerio.load(body);
    } catch {
      throw new Error("Fetch failed");
    }
  };

  const safe = (promise) =>
    promise.catch(() => null);

  const reqWikia = safe(
    loadHtml(
      `https://lyrics.fandom.com/wiki/${encodeURIComponent(artistName)}:${encodeURIComponent(title)}`
    ).then(($) => textln($(".lyricbox")))
  );

  const reqParolesNet = safe(
    loadHtml(
      `https://www.paroles.net/${lyricsUrl(artistName)}/paroles-${lyricsUrl(title)}`
    ).then(($) => {
      if ($(".song-text").length === 0) throw new Error();
      return textln($(".song-text"));
    })
  );

  const reqLyricsMania1 = safe(
    loadHtml(
      `https://www.lyricsmania.com/${lyricsManiaUrl(title)}_lyrics_${lyricsManiaUrl(artistName)}.html`
    ).then(($) => {
      if ($(".lyrics-body").length === 0) throw new Error();
      return textln($(".lyrics-body"));
    })
  );

  const reqLyricsMania2 = safe(
    loadHtml(
      `https://www.lyricsmania.com/${lyricsManiaUrl(title)}_${lyricsManiaUrl(artistName)}.html`
    ).then(($) => {
      if ($(".lyrics-body").length === 0) throw new Error();
      return textln($(".lyrics-body"));
    })
  );

  const reqLyricsMania3 = safe(
    loadHtml(
      `https://www.lyricsmania.com/${lyricsManiaUrlAlt(title)}_lyrics_${lyricsManiaUrlAlt(artistName)}.html`
    ).then(($) => {
      if ($(".lyrics-body").length === 0) throw new Error();
      return textln($(".lyrics-body"));
    })
  );

  const reqSweetLyrics = safe(
    (async () => {
      const formData = new URLSearchParams({ search: "title", searchtext: title });
      const searchRes = await fetch("https://www.sweetslyrics.com/search.php", {
        method: "POST",
        body: formData,
      });
      const searchHtml = await searchRes.text();
      const $ = cheerio.load(searchHtml);

      let closestLink,
        closestScore = -1;
      $(".search_results_row_color").each((_, e) => {
        const artist = $(e).text().replace(/ - .+$/, "");
        const score = levenshtein.get(artistName, artist);
        if (closestScore === -1 || score < closestScore) {
          closestScore = score;
          closestLink = $(e).find("a").last().attr("href");
        }
      });

      if (!closestLink) return null;

      const lyricRes = await fetch("https://www.sweetslyrics.com/" + closestLink);
      const lyricHtml = await lyricRes.text();
      const $$ = cheerio.load(lyricHtml);
      return textln($$(".lyric_full_text"));
    })()
  );

  const promises = [reqWikia, reqParolesNet, reqLyricsMania1, reqLyricsMania2, reqLyricsMania3, reqSweetLyrics];

  if (/\(.*\)/.test(title) || /\[.*\]/.test(title)) {
    promises.push(findLyrics(title.replace(/\(.*\)/g, "").replace(/\[.*\]/g, ""), artistName));
  }

  const results = await Promise.all(promises);
  const valid = results.find((r) => r && r.trim().length > 0);

  return valid || "Lyrics not found.";
}
