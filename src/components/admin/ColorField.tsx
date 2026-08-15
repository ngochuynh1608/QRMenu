"use client";

import { useState } from "react";

export function ColorField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <label className="block text-sm font-medium">
      {label}
      <div className="mt-1 flex gap-2">
        <input
          type="color"
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="h-11 w-14 cursor-pointer rounded-lg border border-border bg-white p-1"
        />
        <span className="flex min-h-[44px] flex-1 items-center rounded-lg border border-border bg-white px-3 text-sm text-muted">
          {value}
        </span>
      </div>
    </label>
  );
}
