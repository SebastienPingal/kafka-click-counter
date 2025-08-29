import { createClient } from "redis"

export const runtime = "nodejs"

export async function GET() {
  const encoder = new TextEncoder()
  let sub: ReturnType<typeof createClient> | null = null
  const stream = new ReadableStream<Uint8Array>({
    start: async (controller) => {
      const url = process.env.REDIS_URL || "redis://127.0.0.1:6379"
      sub = createClient({ url })
      sub.on("error", (err) => {
        console.error("🛑 SSE Redis subscriber error:", err)
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: "redis sub error" })}\n\n`))
      })

      await sub.connect()
      console.log("🟢 SSE connected to Redis subscriber")

      // Send an initial comment to open the stream
      controller.enqueue(encoder.encode(`: ok\n\n`))

      // Send the current total once on connect
      try {
        const initClient = createClient({ url })
        await initClient.connect()
        const value = await initClient.get("clicks:count")
        const initial = Number.parseInt(value ?? "0", 10) || 0
        controller.enqueue(encoder.encode(`event: total\ndata: ${initial}\n\n`))
        await initClient.quit()
      } catch (e) {
        console.error("⚠️ SSE failed to fetch initial total:", e)
      }

      await sub.subscribe("clicks:total", (message) => {
        const data = encoder.encode(`event: total\ndata: ${message}\n\n`)
        controller.enqueue(data)
      })
    },
    cancel: async () => {
      try {
        if (sub) {
          await sub.quit()
        }
      } catch {
        // ignore
      }
      // Do not call controller.close() here; stream is already closing
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}


