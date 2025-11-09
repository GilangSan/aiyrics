"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const Navbar = () => {
  const router = useRouter();
  let handleDirect = () => {
    router.push("https://github.com/GilangSan/aiyrics");
  };

  return (
    <div className="w-full py-4 px-8 flex justify-between items-center backdrop-blur-md">
      <span className="text-xl font-bold display">AIyrics</span>
      <div className="flex gap-5">
        <Button variant="outline" onClick={handleDirect} size="lg">
          Github
        </Button>
      </div>
    </div>
  );
};
