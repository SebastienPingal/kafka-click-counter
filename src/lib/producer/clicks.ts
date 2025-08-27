import { kafka } from "../kafka"

export const clicksProducer = kafka.producer()

/**
 * Sends a click event to the "clicks.events" topic.
 * @param event - The event payload to send.
 */
export async function sendClickEvent(event: { event: string }) {
  try {
    await clicksProducer.connect()
    console.log('🕖 connected to clicks producer')
    await clicksProducer.send({
      topic: "clicks.events",
      messages: [{ value: JSON.stringify(event) }],
    })
    // 🖱️ Click event sent successfully
    console.log("🖱️ Click event sent successfully:", event)
  } catch (error) {
    // ⚠️ Failed to send click event
    console.error("⚠️ Failed to send click event:", error)
  }
}