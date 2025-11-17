"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "./Button";
import { CloseIcon } from "../Icons";
import { cn } from "@/lib/utils";
import { EditIcon, RedoIcon, SaveIcon } from "lucide-react";

type TProps = {
  label?: string;
  value?: string;
  mode?: "base" | "overlay";
  layout?: "fixed" | "fill";
  imageClassName?: string;
  onChange: (url: string, file?: File) => void;
  disabled?: boolean;
  // onSave: (file: File) => void
};

export default function ImageUploader({
  label,
  value,
  onChange,
  // onSave,
  mode = "base",
  layout = "fixed",
  imageClassName,
  disabled = false,
}: TProps) {
  // const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const savePayloadRef = useRef<{ url: string; file?: File } | undefined>(
    undefined
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      // setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      if (mode === "base") onChange(objectUrl, selectedFile);
      else {
        savePayloadRef.current = {
          url: objectUrl,
          file: selectedFile,
        };
        setIsEditing(true)
      }
    }
  };

  const handleRemove = () => {
    // setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    onChange("");
  };

  const handleUploadClick = () => {
    if (mode === "overlay" && !isEditing && preview) return;
    inputRef.current?.click();
  };

  const containerClasses = cn(
    "relative rounded-xl overflow-hidden group transition-all duration-300",
    layout === "fill" ? "w-full h-full" : "w-full max-w-sm aspect-square"
  );

  const imageClasses = cn(
    "object-cover rounded-xl transition-all duration-300",
    layout === "fill" && "object-center",
    imageClassName
  );

  if (mode === "base") {
    return (
      <div className="flex flex-col items-center gap-3 w-full">
        {!!label && <p className="text-sm font-medium">{label}</p>}

        {!preview ? (
          <div
            onClick={handleUploadClick}
            className={cn(
              "border-2 border-dashed border-muted-foreground/40 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors",
              layout === "fill"
                ? "w-full h-full"
                : "w-full max-w-sm aspect-square"
            )}
          >
            <p className="text-sm text-muted-foreground mb-2">
              Click or drag an image
            </p>
            <Button type="button" variant="outline" size="sm">
              Choose File
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className={containerClasses}>
            <Image src={preview} alt="Preview" fill className={imageClasses} />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 rounded-full aspect-square"
              onClick={handleRemove}
              disabled={disabled}
            >
              <CloseIcon />
            </Button>
          </div>
        )}

        {/* {file && (
          <p className="text-sm text-muted-foreground truncate max-w-sm">
            {file.name}
          </p>
        )} */}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full h-full">
      {!!label && <p className="text-sm font-medium mb-1">{label}</p>}

      <div className={containerClasses}>
        {preview && (
          <Image src={preview} alt="Preview" fill className={imageClasses} />
        )}

        <div
          onClick={handleUploadClick}
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center text-center rounded-xl transition-all duration-300 cursor-pointer",
            preview
              ? isEditing
                ? "bg-background/30 hover:bg-background/80"
                : "bg-background/5 hover:bg-background/20 cursor-default"
              : "border-2 border-dashed border-muted-foreground/40 hover:bg-muted/50"
          )}
        >
          <p
            className={cn(
              "text-sm mb-2 transition-opacity duration-300",
              preview ? "text-muted-foreground" : "text-muted-foreground/80"
            )}
          >
            {preview
              ? isEditing
                ? "Click to replace image"
                : "Preview mode"
              : "Click or drag an image"}
          </p>

          {(!preview || isEditing) && (
            <Button type="button" variant="outline" size="sm">
              Choose File
            </Button>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {isEditing && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="rounded-full aspect-square"
              onClick={handleRemove}
              disabled={disabled}
            >
              <CloseIcon />
            </Button>
          )}
          <Button
            type="button"
            variant={isEditing ? "default" : "outline"}
            size="icon"
            className="rounded-full aspect-square"
            disabled={disabled}
            onClick={() => {
              setIsEditing((prev) => !prev);
              if (isEditing) {
                onChange(
                  savePayloadRef.current?.url || "",
                  savePayloadRef.current?.file
                );
                setIsEditing(false);
              }
            }}
          >
            {isEditing ? <SaveIcon /> : <EditIcon />}
          </Button>
          {isEditing && (
            <Button
              type="button"
              variant={"secondary"}
              size="icon"
              className="rounded-full aspect-square"
              disabled={disabled}
              onClick={() => {
                setIsEditing((prev) => !prev);
                setPreview(value || "");
                onChange(value || "");
              }}
            >
              <RedoIcon />
            </Button>
          )}
        </div>
        {/* {preview && (
        )} */}
      </div>

      {/* {file && (
        <p className="text-sm text-muted-foreground truncate max-w-sm">
          {file.name}
        </p>
      )} */}
    </div>
  );
}
