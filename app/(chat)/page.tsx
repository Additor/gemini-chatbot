import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { auth } from '@/auth'
import { Session } from '@/lib/types'
import { getMissingKeys } from '../actions'

export const metadata = {
  title: 'Next.js AI Chatbot'
}

export default async function IndexPage() {
  const id = nanoid()
  const session = (await auth()) as Session
  const missingKeys = await getMissingKeys()

  const modelId = process.env.NEXT_PUBLIC_EVALUATION_TUNED_MODEL_ID!
  return (
    <AI
      initialAIState={{ chatId: id, interactions: [], messages: [], modelId }}
    >
      <Chat id={id} session={session} missingKeys={missingKeys} />
    </AI>
  )
}
