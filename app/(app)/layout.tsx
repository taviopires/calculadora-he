import TopNav from "@/components/TopNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNav />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 pt-8">{children}</main>
    </>
  );
}
