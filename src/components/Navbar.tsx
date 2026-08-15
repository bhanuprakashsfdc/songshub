"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, Menu, X, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useMovies } from "@/context/MovieContext";
import { Movie } from "@/data/movies";
import { motion, AnimatePresence } from "motion/react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { movies } = useMovies();
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim().length > 0) {
      debounceRef.current = setTimeout(() => {
        const query = searchQuery.toLowerCase();
        const filtered = movies
          .filter((movie) => {
            const searchable = [
              movie.title,
              ...movie.genres,
              ...(movie.cast || []),
              movie.director || "",
              movie.category || "",
            ]
              .join(" ")
              .toLowerCase();
            return searchable.includes(query);
          })
          .slice(0, 6);
        setSearchResults(filtered);
        setShowSuggestions(true);
        setActiveSuggestionIndex(-1);
      }, 150);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, movies]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
    setShowProfileMenu(false);
    setShowSuggestions(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowMobileMenu(false);
        setShowProfileMenu(false);
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Songs", path: "/songs" },
    { name: "TV Shows", path: "/tv-shows" },
    { name: "Movies", path: "/movies" },
    { name: "New & Popular", path: "/new-popular" },
    { name: "My List", path: "/my-list" },
  ];

  const handleSuggestionClick = (movie: Movie) => {
    navigate(`/search?q=${encodeURIComponent(movie.title)}`);
    setShowSuggestions(false);
    setSearchQuery("");
    setActiveSuggestionIndex(-1);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      if (activeSuggestionIndex >= 0 && searchResults[activeSuggestionIndex]) {
        e.preventDefault();
        handleSuggestionClick(searchResults[activeSuggestionIndex]);
      } else if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        setShowSuggestions(false);
        clearSearch();
      }
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 h-16 md:h-20 flex items-center px-4 md:px-12 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-xl shadow-lg shadow-black/20"
            : "bg-gradient-to-b from-black/60 to-transparent"
        }`}
      >
        <div className="flex items-center gap-8 w-full justify-between">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-2xl md:text-3xl font-black text-primary tracking-tighter uppercase font-headline focus-ring rounded"
              aria-label="lokaFlix Home"
            >
              LOKAFLIX
            </Link>

            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md focus-ring ${
                      isActive ? "text-white font-bold" : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative" ref={searchRef}>
              <div className="flex items-center bg-black/40 border border-white/10 rounded-md overflow-hidden transition-all duration-300 focus-within:border-white/30 focus-within:bg-black/60">
                <button
                  className="p-2 text-neutral-400 hover:text-white transition-colors focus-ring"
                  aria-label="Search"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                >
                  <Search className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  placeholder="Titles, people, genres"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowSuggestions(true)}
                  onKeyDown={handleSearchKeyDown}
                  className="bg-transparent border-none focus:ring-0 text-sm w-32 md:w-48 text-white placeholder:text-neutral-500 py-2 pr-2 outline-none"
                  aria-label="Search for movies, TV shows, and more"
                  role="combobox"
                  aria-expanded={showSuggestions}
                  aria-autocomplete="list"
                  aria-controls="search-suggestions"
                  aria-activedescendant={activeSuggestionIndex >= 0 ? `suggestion-${activeSuggestionIndex}` : undefined}
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="p-2 text-neutral-400 hover:text-white transition-colors focus-ring"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {showSuggestions && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-80 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl shadow-black/50 overflow-hidden"
                    role="listbox"
                    id="search-suggestions"
                    aria-label="Search suggestions"
                  >
                    <div className="p-2">
                      <p className="text-xs text-neutral-500 px-3 py-2 font-medium uppercase tracking-wider">
                        Suggestions
                      </p>
                      {searchResults.map((movie, index) => (
                        <button
                          key={movie.id}
                          id={`suggestion-${index}`}
                          onClick={() => handleSuggestionClick(movie)}
                          className={`w-full flex items-center gap-3 p-2.5 hover:bg-white/10 rounded-lg transition-colors text-left focus-ring ${
                            index === activeSuggestionIndex ? "bg-white/10" : ""
                          }`}
                          role="option"
                          aria-selected={index === activeSuggestionIndex}
                        >
                           <img
                             src={movie.thumbnail || `/placeholders/movie-01.svg`}
                             alt=""
                             className="w-14 aspect-video object-cover rounded flex-shrink-0"
                             referrerPolicy="no-referrer"
                             onError={(e) => {
                               (e.target as HTMLImageElement).src = `/placeholders/movie-01.svg`;
                             }}
                           />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium truncate">{movie.title}</p>
                            <p className="text-xs text-neutral-500">
                              {movie.year} · {movie.genres[0]}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              className="relative p-2 text-neutral-400 hover:text-white transition-colors focus-ring rounded-md"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" aria-hidden="true" />
            </button>

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1 focus-ring rounded-md p-1"
                aria-expanded={showProfileMenu}
                aria-haspopup="true"
                aria-label="Profile menu"
              >
                <div className="h-8 w-8 rounded-md overflow-hidden border-2 border-transparent hover:border-white/30 transition-colors">
                  <img
                    src="https://picsum.photos/seed/profile/100/100"
                    alt="User profile"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 transition-transform duration-200 hidden md:block ${
                    showProfileMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-56 bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl shadow-black/50 overflow-hidden"
                    role="menu"
                    aria-label="Profile options"
                  >
                    <div className="p-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-300 hover:text-white hover:bg-white/10 transition-colors rounded-md focus-ring"
                        role="menuitem"
                      >
                        <User className="w-4 h-4" />
                        Manage Profiles
                      </Link>
                      <Link
                        to="/my-list"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-300 hover:text-white hover:bg-white/10 transition-colors rounded-md focus-ring"
                        role="menuitem"
                      >
                        <Settings className="w-4 h-4" />
                        Account Settings
                      </Link>
                      <div className="border-t border-white/10 my-1" />
                      <button
                        className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-300 hover:text-white hover:bg-white/10 transition-colors rounded-md w-full text-left focus-ring"
                        role="menuitem"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-neutral-400 hover:text-white transition-colors focus-ring rounded-md"
              aria-label={showMobileMenu ? "Close menu" : "Open menu"}
              aria-expanded={showMobileMenu}
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
              onClick={() => setShowMobileMenu(false)}
              aria-hidden="true"
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 z-50 bg-background/98 backdrop-blur-xl md:hidden"
              aria-label="Mobile navigation"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <span className="text-xl font-black text-primary uppercase">Menu</span>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 text-neutral-400 hover:text-white focus-ring rounded-md"
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex-1 py-4">
                  {navLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        onClick={() => setShowMobileMenu(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={`block px-6 py-3.5 text-base font-medium transition-colors ${
                          isActive
                            ? "text-white bg-white/10 border-l-4 border-primary"
                            : "text-neutral-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
