"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { Movie } from "@/data/movies";
import { getAvailableLanguages } from "@/lib/filters";
import { cn } from "@/lib/utils";

interface LanguageFilterProps {
  items: Movie[];
  value: string;
  onChange: (language: string) => void;
  className?: string;
}

export function LanguageFilter({ items, value, onChange, className }: LanguageFilterProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const languages = getAvailableLanguages(items);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (languages.length === 0) return null;

  const options = [
    { value: "All", label: "All Languages" },
    ...languages.map((l) => ({ value: l, label: l })),
  ];
  const active = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 text-xs font-medium text-neutral-300 hover:bg-white/10 transition-colors focus-ring",
          value !== "All" && "bg-primary/10 text-white"
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Language filter, currently ${active.label}`}
      >
        <span className="text-neutral-400 hidden sm:inline">Language:</span>
        <span className="truncate max-w-[120px]">{active.label}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-neutral-400", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 z-50 min-w-[180px] rounded-xl border border-white/10 bg-background/98 backdrop-blur-xl p-1.5 shadow-2xl"
            role="listbox"
            aria-label="Languages"
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors focus-ring text-left",
                  option.value === value
                    ? "bg-white/10 text-white"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                )}
                role="option"
                aria-selected={option.value === value}
              >
                <span className="truncate">{option.label}</span>
                {option.value === value && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
