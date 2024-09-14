import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import { api, HydrateClient } from "~/trpc/server";
import { MainContent } from "./main";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });

  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#68026d] to-[#2c1523] text-white">
        <div className="absolute left-0 top-0 z-0 h-screen w-full animate-pulse bg-purple-400/10" />
        <div className="container z-10 flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Persu<span className="text-[hsl(126,100%,70%)]">agents</span>
          </h1>
          <MainContent />
        </div>
      </main>
    </HydrateClient>
  );
}
