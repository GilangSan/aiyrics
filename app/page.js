"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Music2, Sparkles, X, Zap } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import AudioPlayer from "./components/AudioPlayer";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { useState, useRef, useEffect, use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import CopyButton from "./components/CopyButton";
import { formatAiTextToJsx } from "./utils/trimAi";

function convertSecondsToDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("search");
  const [songData, setSongData] = useState(null);
  const [lyrics, setLyrics] = useState("");
  const [explained, setExplained] = useState("");
  const [explainLoading, setExplainLoading] = useState(false);
  const [songFound, setSongFound] = useState(false);

  function addBreaksToLyrics() {
    if (!lyrics) return "No lyrics available.";

    const cleanLines = lyrics
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return cleanLines.map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  }

  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  async function fetchSuggestions(query) {
    console.log("hit");
    setLoading(true);
    try {
      const res = await fetch(`/api/search?query=${query}`);
      const data = await res.json();
      setLoading(false);
      setSongFound(true);
      setSuggestions(data.suggestions);
      return data.suggestions;
    } catch (error) {
      console.error(error);
      setLoading(false);
      return [];
    }
  }

  async function fetchLyrics(artist, title) {
    setLoading(true);
    try {
      const res = await fetch(`/api/lyrics?title=${title}&artist=${artist}`);
      const data = await res.json();
      setLyrics(data.lyrics);
      setLoading(false);
      console.log(lyrics);
      return data.lyrics;
    } catch (error) {
      setLoading(false);
      setLyrics("Lyrics not found.");
      console.error(error);
      return "Lyrics not found.";
    }
  }

  async function handleExplain() {
    if (explained.length > 0) return;
    setExplainLoading(true);
    try {
      let ip = await fetch("https://ipinfo.io/json");
      let check = await ip.json();
      let res = await fetch(`/api/explain`, {
        method: "POST",
        body: JSON.stringify({
          lyrics: lyrics,
          country: check.country,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      let result = await res.json();
      setExplained(result.output);
      setExplainLoading(false);
      return result.output;
    } catch (e) {
      setExplainLoading(false);
      return e;
    }
  }

  async function handleBack() {
    setTab("search");
    setLoading(false);
    setExplained("");
  }

  async function handleClear() {
    setQuery("");
  }

  useEffect(() => {
    if (!query.trim()) return;
    if (query.length < 3) return;
    const handler = setTimeout(async () => {
      await fetchSuggestions(query);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  return (
    <>
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center gap-2 px-4 min-h-[85vh] max-sm:min-h-[80vh]">
        <h1 className="text-center font-bold text-3xl">
          Find lyrics and understand their meaning ⚡ faster than ever.
        </h1>
        <p>Try it now!</p>
        {tab === "search" && (
          <>
            <div className="main-container bg-neutral-900 rounded-xl border border-neutral-800 w-full px-6 py-8 mt-6 flex flex-col items-center justify-center gap-4">
              <p className="text-xl">Enter the music title!</p>
              <InputGroup>
                <InputGroupInput
                  onChange={handleSearch}
                  value={query}
                  placeholder="Music Title"
                  disabled={loading && true}
                />
                <InputGroupAddon>
                  <Music2 />
                </InputGroupAddon>
                <InputGroupAddon
                  className={loading ? "block" : "hidden"}
                  align="inline-end"
                >
                  <Spinner />
                </InputGroupAddon>
                <InputGroupAddon
                  className={`${
                    query.length > 0 ? "block" : "hidden"
                  } cursor-pointer hover:text-neutral-300`}
                  align="inline-end"
                  onClick={handleClear}
                >
                  <X />
                </InputGroupAddon>
              </InputGroup>

              {loading && suggestions.length === 0 && (
                <div className="flex flex-col w-full gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-full">
                      <Skeleton className="w-full h-12 rounded-md" />
                    </div>
                  ))}
                </div>
              )}
              {songFound && suggestions.length === 0 && !loading && (
                <p className="text-neutral-400">Song not found.</p>
              )}
              <ul
                className={`suggestion-box w-full ${
                  suggestions.length === 0 ? "hidden" : "flex"
                } flex-col gap-2`}
              >
                {suggestions.slice(0, 5).map((res) => (
                  <li
                    className={`bg-neutral-800/75 cursor-pointer hover:bg-neutral-800 border border-neutral-700 rounded-md w-full px-3 py-2 flex justify-between items-center gap-3 ${
                      loading ? "animate-pulse" : ""
                    }`}
                    key={res.id}
                    onClick={() => {
                      setSongData(res);
                      setTab("song");
                      fetchLyrics(res.artist.name, res.title);
                    }}
                  >
                    <div className="flex gap-3">
                      <Image
                        className="rounded object-cover"
                        width={40}
                        height={40}
                        src={res.album.cover_small.replace(/^http:/, "https:")}
                        alt="Album Cover"
                      />
                      <div className="flex flex-col">
                        <span className="">{res.title}</span>
                        <span className="text-sm text-neutral-500">
                          {res.artist.name}
                        </span>
                      </div>
                    </div>
                    <div>
                      <AudioPlayer
                        src={res.preview.replace(/^http:/, "https:")}
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-neutral-500 text-center">
                We got the lyrics from some open Public API!
                <br />
                See it right{" "}
                <a
                  className="underline"
                  target="blank"
                  href="https://github.com/GilangSan/aiyrics"
                >
                  there
                </a>
              </p>
            </div>
          </>
        )}
        {tab === "song" && (
          <>
            <div className="main-container bg-neutral-900 rounded-xl border border-neutral-800 w-full px-6 py-8 mt-6 flex flex-col gap-4">
              <div className="flex justify-between w-full">
                <div className="flex max-sm:flex-col gap-3 w-full">
                  <div className="flex max-sm:w-full max-sm:justify-center">
                    <Image
                      width={70}
                      height={70}
                      alt="album cover"
                      className="rounded object-cover"
                      src={songData.album.cover_medium.replace(
                        /^http:/,
                        "https:"
                      )}
                    />
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <div>
                      <h2 className="text-xl font-bold">{songData.title}</h2>
                      <p className="text-neutral-300">{songData.album.title}</p>
                      <p className="text-neutral-500">{songData.artist.name}</p>
                    </div>
                    <div className="lg:hidden">
                      <p className="text-neutral-400">
                        {convertSecondsToDuration(songData.duration)}
                      </p>
                      <AudioPlayer
                        src={songData.preview.replace(/^http:/, "https:")}
                        size={35}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 items-center max-sm:hidden">
                  <p className="text-neutral-400">
                    {convertSecondsToDuration(songData.duration)}
                  </p>
                  <AudioPlayer
                    src={songData.preview.replace(/^http:/, "https:")}
                    size={35}
                  />
                </div>
              </div>

              <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl px-6 py-3">
                <div className="flex justify-between items-center">
                  <p className="mb-1">Lyrics</p>
                  <CopyButton textToCopy={lyrics} />
                </div>
                <ScrollArea className="lyrics-container w-full h-50 text-neutral-400">
                  {loading ? (
                    <div className="flex flex-col w-full gap-1">
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className="w-full">
                          <Skeleton className="w-full h-4 rounded-md mb-2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>{addBreaksToLyrics()}</>
                  )}
                </ScrollArea>
              </div>
              <Drawer>
                <div className="flex w-full gap-2">
                  <Button
                    onClick={handleBack}
                    variant={"outline"}
                    className={"flex cursor-pointer"}
                  >
                    <ArrowLeft />
                  </Button>
                  <DrawerTrigger className={"w-full"}>
                    <Button
                      variant="outline"
                      className="w-full cursor-pointer"
                      onClick={handleExplain}
                    >
                      <Sparkles className="mr-1" />
                      Explain
                    </Button>
                  </DrawerTrigger>
                </div>
                <DrawerContent className={"px-3"}>
                  <DrawerHeader>
                    <DrawerTitle className={"flex justify-center"}>
                      <Sparkles className="text-center mr-2" />
                      AI
                    </DrawerTitle>
                  </DrawerHeader>
                  {explainLoading === true ? (
                    <Skeleton
                      className={"h-20 max-w-xl mx-auto w-full rounded-xl"}
                    ></Skeleton>
                  ) : (
                    <ScrollArea className="bg-neutral-900 text-neutral-300 border border-neutral-800 max-w-xl mx-auto w-full max-sm:h-[50vh] px-4 py-3 rounded-xl">
                      <p>{formatAiTextToJsx(explained)}</p>
                    </ScrollArea>
                  )}
                  <DrawerFooter className={"max-w-xl mx-auto"}>
                    <p className="text-neutral-500 text-sm">
                      This message is AI generated.
                    </p>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
          </>
        )}
      </div>
    </>
  );
}
