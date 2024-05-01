import { ReactElement } from 'react'
import { Chat } from '../chat'
import { auth } from '@/auth'
import { getMissingKeys } from '@/app/actions'
import { Session } from '@/lib/types'
import { useAIState } from 'ai/rsc'
import { UIState, getUIStateFromAIState } from '@/lib/chat/actions'

type Props = {
  id: string
}

export async function ChatProvider({ id }: Props): Promise<ReactElement> {
  const session = (await auth()) as Session
  const missingKeys = await getMissingKeys()
  const [aiState] = useAIState()
  const uiState: UIState = getUIStateFromAIState(aiState)

  return (
    <Chat
      id={id}
      session={session}
      missingKeys={missingKeys}
      uiState={uiState}
    />
  )
}
