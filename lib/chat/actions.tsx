// @ts-nocheck
import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState,
  createStreamableValue
} from 'ai/rsc'

import { BotCard, BotMessage } from '@/components/stocks'

import { nanoid } from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'
import { Chat } from '../types'
import { auth } from '@/auth'
import { SelectSeats } from '@/components/flights/select-seats'
import { ListFlights } from '@/components/flights/list-flights'
import { BoardingPass } from '@/components/flights/boarding-pass'
import { PurchaseTickets } from '@/components/flights/purchase-ticket'
import { experimental_generateText } from 'ai'
import { google } from 'ai/google'
import { ListHotels } from '@/components/hotels/list-hotels'
import { Destinations } from '@/components/flights/destinations'
import { rateLimit } from './ratelimit'

async function submitUserMessage(content: string) {
  'use server'

  console.log(`submitUserMessage(${content})`);

  await rateLimit()

  const aiState = getMutableAIState()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content: `${aiState.get().interactions.join('\n\n')}\n\n${content}`
      }
    ]
  })

  // const history = aiState.get().messages.map(message => ({
  //   role: message.role,
  //   content: message.content
  // }))
  // console.log(history)

  const textStream = createStreamableValue('')
  const spinnerStream = createStreamableUI(<SpinnerMessage />)
  const messageStream = createStreamableUI(null)
  const uiStream = createStreamableUI();

  (async () => {
    try {
      const tunedModelId = `tunedModels/${aiState.get().modelId}`;
      const textContent = await generateTextContents(content, tunedModelId);

      spinnerStream.done(null)


      messageStream.update(<BotMessage content={textContent} />)

      aiState.update({
        ...aiState.get(),
        messages: [
          ...aiState.get().messages,
          {
            id: nanoid(),
            role: 'assistant',
            content: textContent
          }
        ]
      })

      uiStream.done()
      textStream.done()
      messageStream.done()
    } catch (e) {
      const error = new Error(e.message)

      uiStream.error(error)
      textStream.error(error)
      messageStream.error(error)
      aiState.done()
    }
  })();

  return {
    id: nanoid(),
    attachments: uiStream.value,
    spinner: spinnerStream.value,
    display: messageStream.value
  }
}

export async function generateTextContents(prompt: string, modelId: string): Promise<string> {
  'use server'

  const projectId = process.env.PROJECT_ID;
  if (!projectId) {
    throw new Error('PROJECT_ID is not set');
  }

  if (!modelId) {
    throw new Error('modelId is not set');
  }

  async function generate(accessToken: string): Promise<string> {
    const model = google.generativeAI(modelId);
    model['config'].headers = function() {
      return {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-goog-user-project': projectId,
      };
    };

    const result = await experimental_generateText({
      model,
      temperature: 0,
      // system: 'Try for the best results',
      // messages: [...history],
      prompt,
    })

    return result.text;
  }

  if (typeof window !== 'undefined') {
    return;
  }

  const { getFixedAccessToken } = require('@/lib/chat/OAuth');
  try {
    const accessToken = await getFixedAccessToken();
    return generate(accessToken);
  } catch (error) {
    console.error('Generate Error:', error);

    const accessToken = await getFixedAccessToken(true);
    return generate(accessToken);
  }
}

export type Message = {
  role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool'
  content: string
  id?: string
  name?: string
  display?: {
    name: string
    props: Record<string, any>
  }
}

export type AIState = {
  chatId: string
  modelId: string
  interactions?: string[]
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
  spinner?: React.ReactNode
  attachments?: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), interactions: [], messages: [], modelId: '' },
  unstable_onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState()

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  unstable_onSetAIState: async ({ state }) => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`
      const title = messages[0].content.substring(0, 100)

      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path
      }

      await saveChat(chat)
    } else {
      return
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'assistant' ? (
          message.display?.name === 'showFlights' ? (
            <BotCard>
              <ListFlights summary={message.display.props.summary} />
            </BotCard>
          ) : message.display?.name === 'showSeatPicker' ? (
            <BotCard>
              <SelectSeats summary={message.display.props.summary} />
            </BotCard>
          ) : message.display?.name === 'showHotels' ? (
            <BotCard>
              <ListHotels />
            </BotCard>
          ) : message.content === 'The purchase has completed successfully.' ? (
            <BotCard>
              <PurchaseTickets status="expired" />
            </BotCard>
          ) : message.display?.name === 'showBoardingPass' ? (
            <BotCard>
              <BoardingPass summary={message.display.props.summary} />
            </BotCard>
          ) : message.display?.name === 'listDestinations' ? (
            <BotCard>
              <Destinations destinations={message.display.props.destinations} />
            </BotCard>
          ) : (
            <BotMessage content={message.content} />
          )
        ) : message.role === 'user' ? (
          <UserMessage showAvatar>{message.content}</UserMessage>
        ) : (
          <BotMessage content={message.content} />
        )
    }))
}
