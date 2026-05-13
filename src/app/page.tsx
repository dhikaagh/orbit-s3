import ConnectionForm from "@/components/auth/ConnectionForm";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          S3
        </div>
        <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Explorer
        </span>
      </div>

      <ConnectionForm />

      <footer className="mt-12 text-zinc-400 text-sm flex items-center gap-4">
        <p>© 2024 S3 Explorer</p>
        <span>•</span>
        <a href="#" className="hover:text-blue-500 transition-colors">Dokumentasi</a>
        <span>•</span>
        <a href="https://github.com/dhikaagh/orbit-s3" className="hover:text-blue-500 transition-colors">GitHub</a>
      </footer>
    </div>
  );
}
