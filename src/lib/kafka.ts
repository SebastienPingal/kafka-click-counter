import { Kafka, logLevel } from "kafkajs"

const brokerUrl = process.env.KAFKA_BROKER_URL
if (!brokerUrl) {
  // 🛑 Missing broker URL for Kafka client
  // Suggestion: Use 🛑 for critical errors
  throw new Error("🛑 KAFKA_BROKER_URL environment variable is not set")
}

export const kafka = new Kafka({
  clientId: "my-app",
  brokers: [brokerUrl],
  logLevel: logLevel.INFO,
})