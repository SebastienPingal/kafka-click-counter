"use client"
import { useEffect, useState } from "react"

export default function Home() {
  const [count, setCount] = useState<number>(0)

  useEffect(() => {
    const es = new EventSource("/api/clicks/stream")
    es.addEventListener("total", (e: MessageEvent) => {
      const value = parseInt(e.data, 10)
      if (!Number.isNaN(value)) setCount(value)
    })
    es.addEventListener("error", () => {
      // ⚠️ SSE error
      console.log("⚠️ SSE error")
    })
    return () => es.close()
  }, [])

  const handleClick = () => {
    fetch("/api/click", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event: "click" }),
    })
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-2xl">Total clicks: {count}</div>

        <button
          className="rounded-full cursor-pointer border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
          onClick={handleClick}
        >
          Click me
        </button>
      </main>
    </div >
  )
}
