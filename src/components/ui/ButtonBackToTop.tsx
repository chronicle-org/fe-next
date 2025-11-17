"use client"

import { useEffect, useState } from "react";
import { ChevronIcon } from "../Icons";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

const ButtonBackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200)
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Button
      className={cn(
        "fixed bottom-6 right-6 rounded-full shadow-lg z-50",
        "bg-[#151821] border border-border transition-all w-fit! h-fit p-1!", {
          "hidden": !visible
        }
      )}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <ChevronIcon direction="top" width={30} height={30} />
    </Button>
  );
};

export default ButtonBackToTop;
