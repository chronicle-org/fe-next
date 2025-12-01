"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export default function ModalTestPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCloseIcon, setShowCloseIcon] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsOpen(false);
      alert("Confirmed!");
    }, 1000);
  };

  return (
    <div className="p-10 flex flex-col gap-4 items-start">
      <h1 className="text-2xl font-bold">Modal Component Test</h1>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showCloseIcon}
            onChange={(e) => setShowCloseIcon(e.target.checked)}
          />
          Show Close Icon
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showFooter}
            onChange={(e) => setShowFooter(e.target.checked)}
          />
          Show Footer (Confirm Button)
        </label>
      </div>

      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Test Modal Title"
        showCloseIcon={showCloseIcon}
        onConfirm={showFooter ? handleConfirm : undefined}
        isLoading={isLoading}
      >
        <p>This is the modal content. You can put anything here.</p>
        <p className="mt-2 text-muted-foreground">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </Modal>
    </div>
  );
}
