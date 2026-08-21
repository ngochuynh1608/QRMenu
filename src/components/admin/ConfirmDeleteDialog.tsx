"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

export const DELETE_CONFIRM_TEXT = "delete";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields?: Record<string, string>;
};

export function ConfirmDeleteDialog({
  open,
  title,
  description,
  onClose,
  action,
  hiddenFields,
}: Props) {
  const [value, setValue] = useState("");
  const [mounted, setMounted] = useState(false);
  const inputId = useId();
  const matches = value === DELETE_CONFIRM_TEXT;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) setValue("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 cursor-pointer bg-black/50 backdrop-blur-[4px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${inputId}-title`}
        className="relative z-10 w-full max-w-md rounded-2xl bg-surface p-5 shadow-[var(--shadow-lift)]"
      >
        <h3 id={`${inputId}-title`} className="font-heading text-xl">
          {title}
        </h3>
        <p className="mt-2 text-sm text-muted">
          {description ? `${description} ` : null}
          Nhập <span className="font-semibold text-text">delete</span> để xác nhận. Không thể hoàn tác.
        </p>
        <form action={action} className="mt-4 space-y-4">
          {Object.entries(hiddenFields ?? {}).map(([name, fieldValue]) => (
            <input key={name} type="hidden" name={name} value={fieldValue} />
          ))}
          <input type="hidden" name="confirm" value={value} />
          <label htmlFor={inputId} className="block text-sm font-medium">
            Xác nhận
            <input
              id={inputId}
              autoFocus
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="delete"
              autoComplete="off"
              spellCheck={false}
              className="mt-1 min-h-[44px] w-full rounded-lg border border-border px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-lg border-2 border-border px-4 font-medium text-muted transition-colors duration-200 hover:bg-background"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!matches}
              className="inline-flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-lg bg-primary px-4 font-semibold text-white transition-colors duration-200 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              Xóa
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
