import { kafka } from "../kafka"
import { incrementClickCounter, closeRedisClient } from "../clicksCounter"

export const clicksAggregator = kafka.consumer({ groupId: "clicks-aggregator" })

async function start() {
  try {
    await clicksAggregator.connect()
    console.log("🟢 kafka consumer connected")

    await clicksAggregator.subscribe({ topic: "clicks.events", fromBeginning: false })
    console.log("🟢 subscribed to topic clicks.events")

    await clicksAggregator.run({
      eachMessage: async () => {
        const newCount = await incrementClickCounter()
        console.log(`🧮 incremented clicks:count to ${newCount}`)
      },
    })
  } catch (error) {
    console.error("⚠️ consumer error:", error)
    process.exitCode = 1
  }
}

start().catch((err) => {
  console.error("🛑 failed to start consumer:", err)
  process.exit(1)
})

const shutdown = async () => {
  try {
    console.log("🛑 Shutting down clicksAggregator gracefully")
    await clicksAggregator.disconnect()
    await closeRedisClient()
  } catch (error) {
    console.error("⚠️ Error during graceful shutdown:", error)
  } finally {
    process.exit(0)
  }
}

process.once("SIGINT", shutdown)
process.once("SIGTERM", shutdown)