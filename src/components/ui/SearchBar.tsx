import { Input } from "@/components/ui/Input";
import { SearchIcon } from "lucide-react";

interface SearchBarProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({
  value,
  placeholder = "Search posts...",
  onChange,
}: SearchBarProps) => {
  return (
    <div className="relative w-full max-w-sm">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
        placeholder={placeholder}
      />
    </div>
  );
};
