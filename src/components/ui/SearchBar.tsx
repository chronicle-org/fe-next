import { Input } from "@/components/ui/Input";
import { cn, debounce } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import { FormEvent, useEffect, useRef } from "react";
import { CloseIcon } from "../Icons";

interface SearchBarProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  debounce?: number;
  shortcut?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
}

export const SearchBar = ({
  value,
  defaultValue,
  placeholder = "Search posts...",
  shortcut,
  onChange,
  onSubmit,
}: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLDivElement>(null);
  const shortcutRef = useRef<HTMLDivElement>(null);
  const debounceSearch = debounce((value: string) => onChange?.(value), 500);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (shortcut && e.key === shortcut) {
        e.preventDefault();

        const searchInput = inputRef.current;

        if (
          /^(?:input|textarea|select|button)$/i.test(
            (e.target as HTMLElement).tagName
          )
        ) {
          return;
        }

        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      } else if (e.key === "Escape") {
        if (inputRef.current === document.activeElement) {
          e.preventDefault();
          inputRef.current?.blur();
        }
      }
    };

    if (defaultValue) {
      closeRef.current?.classList.toggle("hidden", false);
      if (shortcut) shortcutRef.current?.classList.toggle("hidden!", true);
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcut, defaultValue]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputRef.current?.value) {
      onSubmit?.(inputRef.current?.value || "");
      inputRef.current?.blur();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-sm">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        defaultValue={defaultValue}
        onChange={(e) => {
          debounceSearch(e.currentTarget.value);
          if (!inputRef.current?.value)
            closeRef.current?.classList.toggle("hidden", true);
          else if (inputRef.current?.value)
            closeRef.current?.classList.toggle("hidden", false);
        }}
        className="pl-9 truncate"
        placeholder={placeholder}
        ref={inputRef}
        onFocus={() => {
          if (shortcut && !inputRef.current?.value)
            shortcutRef.current?.classList.toggle("hidden!", true);
        }}
        onBlur={() => {
          if (shortcut && !inputRef.current?.value)
            shortcutRef.current?.classList.toggle("hidden!", false);
        }}
      />
      <div
        ref={closeRef}
        className="absolute hidden right-3 top-1/2 -translate-y-1/2 h-fit w-fit text-muted-foreground cursor-pointer"
        onClick={() => {
          debounceSearch("");
          if (inputRef.current) inputRef.current.value = "";
          closeRef.current?.classList.toggle("hidden", true);
          if (shortcut) shortcutRef.current?.classList.toggle("hidden!", false);
        }}
      >
        <CloseIcon className="h-4 w-4" />
      </div>
      {shortcut && (
        <div
          ref={shortcutRef}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 p-2 border max-sm:hidden",
            "text-muted-foreground rounded-sm text-xs flex items-center justify-center"
          )}
        >
          {shortcut}
        </div>
      )}
    </form>
  );
};
