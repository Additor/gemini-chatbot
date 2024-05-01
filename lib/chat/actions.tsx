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
import {
  EvaluationSpinnerMessage,
  ImprovementSpinnerMessage,
  SpinnerMessage,
  UserMessage
} from '@/components/stocks/message'
import { Chat } from '../types'
import { auth } from '@/auth'
import { SelectSeats } from '@/components/flights/select-seats'
import { ListFlights } from '@/components/flights/list-flights'
import { BoardingPass } from '@/components/flights/boarding-pass'
import { PurchaseTickets } from '@/components/flights/purchase-ticket'
import { ListHotels } from '@/components/hotels/list-hotels'
import { Destinations } from '@/components/flights/destinations'
import { rateLimit } from './ratelimit'
import { EvaluationParams } from '@/lib/chat/evaluation.types'
import { doEvaluate } from './evaluation.action'
import { ImprovementParams } from './improvement.types'
import { doImprove } from './improvement.action'
import { EvaluationResult } from '@/components/trouble-makers/evaluation-result'
import { ImprovementResult } from '@/components/trouble-makers/improvement-result'

async function submitMessageToEvaluationModel(
  content: string,
  params?: EvaluationParams
) {
  'use server'

  console.log(`submitMessageToEvaluationModel(${content})`)

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
  const spinnerStream = createStreamableUI(
    params?.exact ? <EvaluationSpinnerMessage /> : <SpinnerMessage />
  )
  const messageStream = createStreamableUI(null)
  const uiStream = createStreamableUI()

  await (async () => {
    try {
      const textContent = await doEvaluate({
        proposalFromUser: content
      })

      spinnerStream.done(null)

      messageStream.update(
        <>
          <BotMessage content={textContent.guideText} />
          <BotCard>
            <EvaluationResult
              proposalEvaluation={message.display.props.proposalEvaluation}
            />
          </BotCard>
        </>
      )

      aiState.update({
        ...aiState.get(),
        messages: [
          ...aiState.get().messages,
          {
            id: nanoid(),
            role: 'assistant',
            content: textContent.guideText,
            display: {
              name: 'evaluationResult',
              props: {
                proposalEvaluation: textContent.evaluation
              }
            }
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
  })()

  return {
    id: nanoid(),
    attachments: uiStream.value,
    spinner: spinnerStream.value,
    display: messageStream.value
  }
}

async function submitMessageToImprovementModel(
  content: string,
  params?: ImprovementParams
) {
  'use server'

  console.log(`submitMessageToImprovementModel(${content})`)

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
  const spinnerStream = createStreamableUI(
    exact ? <ImprovementSpinnerMessage /> : <SpinnerMessage />
  )
  const messageStream = createStreamableUI(null)
  const uiStream = createStreamableUI()

  await (async () => {
    try {
      const textContent = await doImprove({
        content: {
          proposalFromUser: content
        }
      })

      spinnerStream.done(null)

      messageStream.update(
        <>
          <BotMessage content={textContent.guideText} />
          <BotCard>
            <ImprovementResult markdown={message.display.props.markdown} />
          </BotCard>
        </>
      )

      aiState.update({
        ...aiState.get(),
        messages: [
          ...aiState.get().messages,
          {
            id: nanoid(),
            role: 'assistant',
            content: textContent.guideText,
            display: {
              name: 'improvementResult',
              props: {
                markdown: textContent.markdown
              }
            }
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
  })()

  return {
    id: nanoid(),
    attachments: uiStream.value,
    spinner: spinnerStream.value,
    display: messageStream.value
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
    submitMessageToEvaluationModel,
    submitMessageToImprovementModel
  },
  initialUIState: [],
  initialAIState: {
    chatId: nanoid(),
    interactions: [],
    messages: [],
    modelId: ''
  },
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
          message.display?.name === 'evaluationResult' ? (
            <BotCard>
              <EvaluationResult
                proposalEvaluation={message.display.props.proposalEvaluation}
              />
            </BotCard>
          ) : message.display?.name === 'improvementResult' ? (
            <BotCard>
              <ImprovementResult markdown={message.display.props.markdown} />
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
