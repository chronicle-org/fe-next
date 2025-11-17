"use client";

import { useEffect, useState } from "react";

type theme = "light" | "dark";
export function useTheme() {
   const [theme, setTheme] = useState<theme>(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return (stored as theme) || (prefersDark ? "dark" : "light");
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  return { theme, toggleTheme };
}
