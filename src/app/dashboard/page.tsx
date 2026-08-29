import dynamic from "next/dynamic";
import { auth } from "@/auth";

const DashboardClient = dynamic(() => import("./DashboardClient"), {
  loading: () => (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-plus-jakarta">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-accent border-t-transparent" />
        <span className="text-sm font-semibold text-zinc-400">Loading Dashboard...</span>
      </div>
    </div>
  ),
});

export default async function DashboardPage() {
  const session = await auth();

  return <DashboardClient session={session} />;
}
