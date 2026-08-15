import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-heading text-3xl">Không tìm thấy</h1>
      <p className="text-muted">Nhà hàng hoặc trang này không tồn tại.</p>
      <Link
        href="/"
        className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg bg-cta px-4 font-semibold text-white transition-colors duration-200 hover:bg-cta-dark"
      >
        Về danh sách nhà hàng
      </Link>
    </main>
  );
}
