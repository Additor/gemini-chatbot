'use client'
import { MemoizedReactMarkdown } from '../markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { CodeBlock } from '../ui/codeblock'
import { Button } from '../ui/button'
import { IconChartDots, IconSparkles } from '@tabler/icons-react'
import { CopyButton } from './copy-button'
import { useAIState, useActions, useUIState } from 'ai/rsc'
import { AI } from '@/lib/chat/actions'
import { nanoid } from 'nanoid'
import {
  EvaluationSpinnerMessage,
  ImprovementSpinnerMessage,
  UserMessage
} from '../stocks/message'
import { toast } from 'sonner'
import * as React from 'react'

const EVALUATE_MESSAGE = 'Evaluate the improved proposal.'
const IMPROVE_MESSAGE = 'Regenerate the improved proposal.'

type Props = {
  markdown: string
}

export function ImprovementResult({ markdown }: Props) {
  const [aiState] = useAIState()
  const [messages, setMessages] = useUIState<typeof AI>()
  const { submitMessageToEvaluationModel, submitMessageToImprovementModel } =
    useActions()

  const handleEvaluate = async (): Promise<void> => {
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: (
          <UserMessage>
            <b>{EVALUATE_MESSAGE}</b>
          </UserMessage>
        )
      },
      {
        id: nanoid(),
        display: <EvaluationSpinnerMessage />
      }
    ])

    try {
      const responseMessage = await submitMessageToEvaluationModel(markdown, {
        exact: true,
        ...aiState.evaluationParams
      })

      setMessages(currentMessages => [
        ...currentMessages.slice(0, -1),
        responseMessage
      ])
    } catch (e) {
      toast(
        <div className="text-red-600">
          You have reached your message limit! Please try again later.
        </div>
      )
    }
  }

  const handleRegenerate = async (): Promise<void> => {
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: (
          <UserMessage>
            <b>{IMPROVE_MESSAGE}</b>
          </UserMessage>
        )
      },
      {
        id: nanoid(),
        display: <ImprovementSpinnerMessage />
      }
    ])

    try {
      const responseMessage = await submitMessageToImprovementModel(
        IMPROVE_MESSAGE,
        {
          exact: true,
          ...aiState.improvementParams
        }
      )

      setMessages(currentMessages => [
        ...currentMessages.slice(0, -1),
        responseMessage
      ])
    } catch (e) {
      toast(
        <div className="text-red-600">
          You have reached your message limit! Please try again later.
        </div>
      )
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <MemoizedReactMarkdown
        className="prose break-words prose-p:leading-relaxed prose-pre:p-0"
        remarkPlugins={[remarkGfm, remarkMath]}
        components={{
          p({ children }) {
            return <p className="mb-2 last:mb-0">{children}</p>
          },
          code({ node, inline, className, children, ...props }) {
            if (children.length) {
              if (children[0] == '▍') {
                return (
                  <span className="mt-1 cursor-default animate-pulse">▍</span>
                )
              }

              children[0] = (children[0] as string).replace('`▍`', '▍')
            }

            const match = /language-(\w+)/.exec(className || '')

            if (inline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            }

            return (
              <CodeBlock
                key={Math.random()}
                language={(match && match[1]) || ''}
                value={String(children).replace(/\n$/, '')}
                {...props}
              />
            )
          }
        }}
      >
        {markdown}
      </MemoizedReactMarkdown>
      <div className="flex gap-2 mt-4">
        <CopyButton text={markdown} />
        <Button
          variant="outline"
          className="inline-flex gap-1"
          onClick={handleEvaluate}
        >
          <IconChartDots size={16} color="rgb(148 163 184)" />
          <span>Evalute This Version</span>
        </Button>
        <Button
          variant="outline"
          className="inline-flex gap-1"
          onClick={handleRegenerate}
        >
          <IconSparkles size={16} color="rgb(148 163 184)" />
          <span>Regenerate</span>
        </Button>
      </div>
    </div>
  )
}
