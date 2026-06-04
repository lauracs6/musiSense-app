import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PlaylistDetail from "./pages/PlaylistDetail";
import CreatePlaylist from "./pages/CreatePlaylist";
import GenreDetail from "./pages/GenreDetail";
import AlbumDetail from "./pages/AlbumDetail";
import ArtistDetail from "./pages/ArtistDetail";
import ArtistsList from "./pages/ArtistsList";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import { isTrackPlayable } from "./utils/trackUtils";

function App() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [playedIndices, setPlayedIndices] = useState([]);

  useEffect(() => {
    setPlayedIndices([]);
  }, [queue, isShuffle]);

  // Limpiar reproductor cuando se recibe evento de canción/playlist inválida
  useEffect(() => {
    const handleInvalid = () => {
      setCurrentTrack(null);
      setQueue([]);
      setPlayedIndices([]);
    };
    window.addEventListener("track-invalidated", handleInvalid);
    return () => window.removeEventListener("track-invalidated", handleInvalid);
  }, []);

  const handleInvalidTrack = () => {
    setCurrentTrack(null);
    setQueue([]);
    setPlayedIndices([]);
  };

  const handlePlay = (track, trackList = []) => {
    if (!isTrackPlayable(track)) return;
    const playableTracks = trackList.filter((t) => isTrackPlayable(t));
    setCurrentTrack(track);
    if (playableTracks.length > 0) {
      setQueue(playableTracks);
      const index = playableTracks.findIndex((t) => t.id === track.id);
      setPlayedIndices([index]);
    } else {
      setQueue([]);
      setCurrentTrack(null);
      setPlayedIndices([]);
    }
  };

  const handleNext = () => {
    if (queue.length === 0 || !currentTrack) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    if (isShuffle) {
      const remainingIndices = queue
        .map((_, idx) => idx)
        .filter((idx) => !playedIndices.includes(idx));
      if (remainingIndices.length > 0) {
        const randomIndex =
          remainingIndices[Math.floor(Math.random() * remainingIndices.length)];
        setCurrentTrack(queue[randomIndex]);
        setPlayedIndices([...playedIndices, randomIndex]);
      } else {
        setCurrentTrack(null);
        setPlayedIndices([]);
      }
    } else {
      if (currentIndex < queue.length - 1) {
        setCurrentTrack(queue[currentIndex + 1]);
      } else {
        setCurrentTrack(null);
      }
    }
  };

  const handlePrev = () => {
    if (queue.length === 0 || !currentTrack) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex > 0) {
      setCurrentTrack(queue[currentIndex - 1]);
    }
  };

  return (
    <MainLayout
      currentTrack={currentTrack}
      onNext={handleNext}
      onPrev={handlePrev}
      isShuffle={isShuffle}
      setIsShuffle={setIsShuffle}
      onTrackInvalid={handleInvalidTrack}
    >
      <Routes>
        <Route path="/" element={<Home onPlay={handlePlay} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<Search onPlay={handlePlay} />} />
        <Route path="/create-playlist" element={<CreatePlaylist />} />
        <Route path="/genre/:id" element={<GenreDetail />} />
        <Route
          path="/album/:id"
          element={<AlbumDetail onPlay={handlePlay} />}
        />
        <Route path="/artist/:artistName" element={<ArtistDetail />} />
        <Route path="/artists" element={<ArtistsList />} />
        <Route
          path="/playlist/:id"
          element={
            <PlaylistDetail
              onPlay={handlePlay}
              isShuffle={isShuffle}
              setIsShuffle={setIsShuffle}
            />
          }
        />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
