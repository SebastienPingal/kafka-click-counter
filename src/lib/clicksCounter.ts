import { createClient } from "redis"

const redisUrl = process.env.REDIS_URL || "redis://:eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81@127.0.0.1:6379"
const redisClient = createClient({ url: redisUrl })

redisClient.on("error", (err) => {
  // 🛑 Redis connection error
  console.error("🛑 Redis connection error:", err)
  const message = (err as Error)?.message || String(err)
  if (message.includes("WRONGPASS") || message.includes("NOAUTH")) {
    console.error("🛑 Redis auth failed – exiting to avoid error loop")
    process.exit(1)
  }
})

/**
 * Increments the click counter in Redis.
 * @returns {Promise<number>} The new value of the click counter.
 */
export async function incrementClickCounter(): Promise<number> {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect()
    }
    const newCount = await redisClient.incr("clicks:count")
    // 🧮 Click counter incremented
    console.log("🧮 Click counter incremented:", newCount)
    return newCount
  } catch (error) {
    // ⚠️ Failed to increment click counter
    console.error("⚠️ Failed to increment click counter:", error)
    throw error
  }
}

/**
 * Retrieves the current click counter value from Redis.
 * @returns {Promise<number>} The current value of the click counter.
 */
export async function getClickCounter(): Promise<number> {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect()
    }
    const value = await redisClient.get("clicks:count")
    const count = value ? parseInt(value, 10) : 0
    // 🔢 Current click counter value retrieved
    console.log("🔢 Current click counter value retrieved:", count)
    return count
  } catch (error) {
    // ⚠️ Failed to retrieve click counter
    console.error("⚠️ Failed to retrieve click counter:", error)
    throw error
  }
}

/** Ensures a single Redis connection is established (no-op if already open). */
export async function ensureRedisConnected(): Promise<void> {
  if (!redisClient.isOpen) {
    await redisClient.connect()
  }
}

/** Gracefully closes the Redis connection. */
export async function closeRedisClient(): Promise<void> {
  if (redisClient.isOpen) {
    await redisClient.quit()
  }
}
