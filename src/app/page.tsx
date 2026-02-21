import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 dark">
      <div className="z-10 w-full max-w-md flex flex-col items-center justify-between space-y-8 p-10 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Sathi
          </h1>
          <p className="text-slate-300 font-medium">Your Student Task Hub</p>
        </div>

        <div className="flex flex-col gap-5 w-full mt-8">
          <Link href="/auth?role=student" className="w-full">
            <Button className="w-full text-lg font-semibold h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-all rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-400/50 hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]">
              Enter as Student
            </Button>
          </Link>
          <Link href="/auth?role=cr" className="w-full">
            <Button
              variant="outline"
              className="w-full text-lg font-semibold h-14 bg-transparent border-slate-600 text-slate-300 hover:bg-white/10 hover:text-white transition-all rounded-xl"
            >
              Enter as CR/IC
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
