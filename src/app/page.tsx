import { MainContent } from "./main";

export default async function Home() {
  return (
    <main className="relative flex h-full min-h-screen flex-col items-center bg-gradient-to-b from-purple-100 to-purple-300 dark:from-purple-800 dark:to-purple-900">
      <div className="container z-10 flex h-full flex-col items-center justify-start gap-12 px-4 py-16 md:h-2/3">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-[5rem] dark:text-white">
          HT
          <span className="bg-gradient-to-r from-gray-900 from-50% to-purple-900 to-50% bg-clip-text text-transparent dark:from-white dark:to-purple-300">
            M
          </span>
          <span className="bg-gradient-to-r from-purple-900 to-purple-700 bg-clip-text text-transparent dark:from-purple-300 dark:to-purple-500">
            LCHEMY
          </span>
        </h1>
        <MainContent />
      </div>
      <div className="absolute left-0 top-0 z-0 h-full min-h-screen w-full animate-pulse bg-green-400/20 dark:bg-green-600/20" />
    </main>
  );
}
