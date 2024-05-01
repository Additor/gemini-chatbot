import { AI } from '@/lib/chat/actions'
import { nanoid } from 'nanoid'
import { Chat } from '@/components/chat'
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

  return (
    <AI
      initialAIState={{
        chatId: id,
        interactions: [],
        messages: [],
        originalProposalContent: null
      }}
    >
      <Chat id={id} session={session} missingKeys={missingKeys} />
    </AI>
  )
}
