import { AI } from '@/lib/chat/actions'
import { ChatProvider } from '@/components/trouble-makers/chat-provider'
import { nanoid } from 'nanoid'

export const metadata = {
  title: 'Next.js AI Chatbot'
}

export default async function IndexPage() {
  const id = nanoid()
  const modelId = process.env.NEXT_PUBLIC_EVALUATION_TUNED_MODEL_ID!
  return (
    <AI
      initialAIState={{ chatId: id, interactions: [], messages: [], modelId }}
    >
      <ChatProvider id={id} />
    </AI>
  )
}
