'use client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { IconChevronDown } from '@tabler/icons-react'
import { Children, useState } from 'react'
import {
  ProposalEvaluation,
  ProposalEvaluationCategory,
  TextLength,
  TextLengths,
  Tone,
  Tones
} from '@/lib/types'
import { useActions, useUIState } from 'ai/rsc'
import { AI } from '@/lib/chat/actions'
import { nanoid } from 'nanoid'
import { ImprovementSpinnerMessage, UserMessage } from '../stocks/message'
import { toast } from 'sonner'
import { ImprovementParams } from '@/lib/chat/improvement.types'

const IMPROVE_MESSAGE = 'Improve the proposal with given settings.'
const MIN_SCORE = 1
const MAX_SCORE = 4

function getOverallScoreLabel(overallScore: number): string {
  if (overallScore >= MAX_SCORE - 1) {
    return 'Good'
  }

  if (overallScore >= MAX_SCORE - 2) {
    return 'Moderate'
  }

  return 'Bad'
}

type Props = {
  proposalEvaluation: ProposalEvaluation
}

export function EvaluationResult({
  proposalEvaluation: proposalEvaluationProp
}: Props) {
  const [messages, setMessages] = useUIState<typeof AI>()
  const { submitMessageToImprovementModel } = useActions()
  const [proposalEvaluation, setProposalEvaluation] = useState(
    proposalEvaluationProp
  )
  const [improvementParams, setImprovementParams] = useState<
    ImprovementParams | undefined
  >(undefined)
  const tableData = Object.entries(proposalEvaluation.data)
  const isAllChecked = tableData.every(([, { shouldImprove }]) => shouldImprove)

  const handleCheckAllCategory = (): void => {
    setProposalEvaluation(prev => {
      const updatedData = Object.entries(prev.data).map(([category, value]) => {
        return [
          category,
          {
            ...value,
            shouldImprove: !isAllChecked
          }
        ]
      })

      return {
        ...prev,
        data: Object.fromEntries(updatedData)
      }
    })
  }

  const handleCheckCategoryItem = (
    category: ProposalEvaluationCategory,
    shouldImprove: boolean
  ): void => {
    setProposalEvaluation(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [category]: {
          ...prev.data[category],
          shouldImprove
        }
      }
    }))
  }

  const handleChangeTextLength = (textLength: TextLength): void => {
    setImprovementParams(prev =>
      prev ? { ...prev, textLength } : { textLength }
    )
  }

  const handleChangeTone = (tone: Tone): void => {
    setImprovementParams(prev => (prev ? { ...prev, tone } : { tone }))
  }

  const handleClickImprove = async (): Promise<void> => {
    const checkedCategories = Object.entries(proposalEvaluation.data)
      .filter(([key, value]) => {
        return value.shouldImprove
      })
      .map(([key, value]) => key)

    const settings = Object.entries<ImprovementParams[keyof ImprovementParams]>(
      improvementParams || {}
    )
      .filter(([key, value]) => {
        return typeof value === 'string'
      })
      .map(([key, value]) => value)

    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: (
          <UserMessage>
            <b>{IMPROVE_MESSAGE}</b>
            <ul>
              <li>- Categories: {checkedCategories.join(', ')}</li>
              <li>
                - Settings: {settings.length ? settings.join(', ') : 'N/A'}
              </li>
            </ul>
          </UserMessage>
        )
      }
    ])

    try {
      const responseMessage = await submitMessageToImprovementModel(
        IMPROVE_MESSAGE,
        {
          exact: true,
          ...improvementParams
        }
      )

      setMessages(currentMessages => [...currentMessages, responseMessage])
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
      <h6>Overall score</h6>
      <div className="flex gap-4">
        <h1 className="text-2xl sm:text-3xl tracking-tight font-semibold max-w-fit inline-block">
          {proposalEvaluation.overallScore} / {MAX_SCORE}
        </h1>
        <Badge variant="secondary">
          {getOverallScoreLabel(proposalEvaluation.overallScore)}
        </Badge>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[46px]">
              <Checkbox
                checked={isAllChecked}
                onClick={handleCheckAllCategory}
              />
            </TableHead>
            <TableHead className="w-[90px]">Category</TableHead>
            <TableHead className="w-[60px]">Score</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Children.toArray(
            tableData.map(
              ([category, { score, description, shouldImprove }]) => (
                <TableRow>
                  <TableCell>
                    <Checkbox
                      checked={shouldImprove}
                      onClick={() =>
                        handleCheckCategoryItem(
                          category as ProposalEvaluationCategory,
                          !shouldImprove
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">{category}</TableCell>
                  <TableCell className="font-medium">
                    {score} / {MAX_SCORE}
                  </TableCell>
                  <TableCell>{description}</TableCell>
                </TableRow>
              )
            )
          )}
        </TableBody>
      </Table>
      <div className="flex gap-3 mt-2">
        <Button onClick={handleClickImprove}>✨ Improve my proposal</Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Settings</Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="top"
            sideOffset={8}
            className="w-96"
          >
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Settings</h4>
                <p className="text-sm text-muted-foreground">
                  to create the improved proposal content
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="width" className="w-20">
                    Text Length
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      {improvementParams?.textLength ? (
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {improvementParams.textLength}
                          <IconChevronDown size={20} color="#71717A" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          Select...
                        </Button>
                      )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        style={{ cursor: 'pointer' }}
                        className="flex-col items-start"
                        onClick={() =>
                          handleChangeTextLength(TextLengths.Simple)
                        }
                      >
                        <p>{TextLengths.Simple}</p>
                        <p className="text-xs" style={{ color: '#8C8F94' }}>
                          1-2 paragraphs (around 15-70 words)
                        </p>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        style={{ cursor: 'pointer' }}
                        className="flex-col items-start"
                        onClick={() =>
                          handleChangeTextLength(TextLengths.Moderate)
                        }
                      >
                        <p>{TextLengths.Moderate}</p>
                        <p className="text-xs" style={{ color: '#8C8F94' }}>
                          2-3 paragraphs (around 70-120 words)
                        </p>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        style={{ cursor: 'pointer' }}
                        className="flex-col items-start"
                        onClick={() =>
                          handleChangeTextLength(TextLengths.Detailed)
                        }
                      >
                        <p>{TextLengths.Detailed}</p>
                        <p className="text-xs" style={{ color: '#8C8F94' }}>
                          3+ paragraphs (around 120-170 words)
                        </p>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="maxWidth" className="w-20">
                    Tone
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      {improvementParams?.tone ? (
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {improvementParams.tone}
                          <IconChevronDown size={20} color="#71717A" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          Select...
                        </Button>
                      )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {Children.toArray(
                        Object.values(Tones).map(tone => (
                          <DropdownMenuItem
                            onClick={() => handleChangeTone(tone)}
                            style={{ cursor: 'pointer' }}
                          >
                            {tone}
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
