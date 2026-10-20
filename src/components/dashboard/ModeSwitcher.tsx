"use client";

import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ModeSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMovies = location.pathname.includes("/movies");

  return (
    <Tabs value={isMovies ? "movies" : "songs"} onValueChange={(val) => navigate(`/${val}`)}>
      <TabsList>
        <TabsTrigger value="movies">🎬 Movies</TabsTrigger>
        <TabsTrigger value="songs">🎵 Songs</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
