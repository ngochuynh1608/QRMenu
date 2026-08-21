"use client";

import { useState } from "react";
import { FileUp } from "lucide-react";
import { MenuImportDialog, type ImportRestaurantOption } from "@/components/admin/MenuImport";

export function ImportNavButton({ restaurants }: { restaurants: ImportRestaurantOption[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted transition-colors duration-200 hover:bg-background hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <FileUp className="h-4 w-4" />
        Import
      </button>
      {open ? <MenuImportDialog restaurants={restaurants} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
