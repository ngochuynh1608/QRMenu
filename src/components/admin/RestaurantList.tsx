"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { GripVertical } from "lucide-react";
import { reorderRestaurants } from "@/app/admin/actions";

export type RestaurantListItem = {
  id: string;
  name: string;
  slug: string;
  venueType: string;
  isActive: boolean;
  categoryCount: number;
  itemCount: number;
};

export function RestaurantList({
  restaurants,
  canManage = true,
}: {
  restaurants: RestaurantListItem[];
  canManage?: boolean;
}) {
  const [items, setItems] = useState(restaurants);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const itemsRef = useRef(restaurants);
  const draggingIdRef = useRef<string | null>(null);
  const originRef = useRef<string[] | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (draggingIdRef.current) return;
    itemsRef.current = restaurants;
    setItems(restaurants);
  }, [restaurants]);

  function persist(next: RestaurantListItem[]) {
    if (!canManage) return;
    startTransition(async () => {
      await reorderRestaurants(next.map((item) => item.id));
    });
  }

  function onPointerDown(event: React.PointerEvent<HTMLButtonElement>, id: string) {
    if (!canManage) return;
    if (event.button !== 0) return;
    event.preventDefault();
    originRef.current = itemsRef.current.map((item) => item.id);
    draggingIdRef.current = id;
    setDraggingId(id);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    const activeId = draggingIdRef.current;
    if (!activeId) return;
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const row = target?.closest("[data-restaurant-id]");
    const overId = row instanceof HTMLElement ? row.dataset.restaurantId : undefined;
    if (!overId || overId === activeId) return;

    const current = itemsRef.current;
    const from = current.findIndex((item) => item.id === activeId);
    const to = current.findIndex((item) => item.id === overId);
    if (from < 0 || to < 0 || from === to) return;
    const next = [...current];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    itemsRef.current = next;
    setItems(next);
  }

  function onPointerUp() {
    if (!draggingIdRef.current) return;
    draggingIdRef.current = null;
    setDraggingId(null);
    const next = itemsRef.current;
    const started = originRef.current;
    originRef.current = null;
    if (!started || started.join() === next.map((item) => item.id).join()) return;
    persist(next);
  }

  return (
    <div className="space-y-3">
      {canManage ? (
        <p className="text-sm text-muted">Kéo biểu tượng để đổi thứ tự hiển thị trên trang QR.</p>
      ) : null}
      <ul className="space-y-3">
        {items.map((restaurant) => {
          const dragging = restaurant.id === draggingId;
          return (
            <li
              key={restaurant.id}
              data-restaurant-id={restaurant.id}
              className={`rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)] transition-[box-shadow,opacity] duration-200 ${
                dragging ? "opacity-70 shadow-[var(--shadow-lift)] ring-2 ring-primary" : ""
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-2">
                  {canManage ? (
                    <button
                      type="button"
                      aria-label={`Kéo để sắp xếp ${restaurant.name}`}
                      onPointerDown={(event) => onPointerDown(event, restaurant.id)}
                      onPointerMove={onPointerMove}
                      onPointerUp={onPointerUp}
                      onPointerCancel={onPointerUp}
                      className="mt-0.5 flex h-11 w-11 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-muted transition-colors duration-200 hover:bg-background hover:text-primary active:cursor-grabbing"
                    >
                      <GripVertical className="h-5 w-5" />
                    </button>
                  ) : null}
                  <div className="min-w-0">
                    <p className="font-heading text-xl">{restaurant.name}</p>
                    <p className="text-sm text-muted">
                      /r/{restaurant.slug} · {restaurant.venueType === "hotel" ? "Hotel" : "QSR"} ·{" "}
                      {restaurant.categoryCount} danh mục · {restaurant.itemCount} món
                      {restaurant.isActive ? "" : " · ẩn"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {canManage ? (
                    <Link
                      href={`/admin/restaurants/${restaurant.id}`}
                      className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg border-2 border-primary px-3 font-medium text-primary transition-colors duration-200 hover:bg-primary hover:text-white"
                    >
                      Thông tin
                    </Link>
                  ) : null}
                  <Link
                    href={`/admin/restaurants/${restaurant.id}/menu`}
                    className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg bg-primary px-3 font-medium text-white transition-colors duration-200 hover:bg-primary-dark"
                  >
                    Menu
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
