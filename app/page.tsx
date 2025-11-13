import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-5xl font-bold tracking-tight">
          Holiday Extras Arcade Escape Room
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Setup in progress...
        </p>
        <Link
          href="/play"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Enter Arcade
        </Link>
      </div>
    </main>
  )
}

