export default function MenuLoading() {
  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 py-6">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-border" />
      <div className="mt-4 aspect-[16/7] animate-pulse rounded-xl bg-border" />
      <div className="mt-6 space-y-3">
        <div className="h-24 animate-pulse rounded-2xl bg-border" />
        <div className="h-24 animate-pulse rounded-2xl bg-border" />
        <div className="h-24 animate-pulse rounded-2xl bg-border" />
      </div>
    </div>
  );
}
