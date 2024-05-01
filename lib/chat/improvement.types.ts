import { TextLength, Tone } from '@/lib/types'

export type ImprovementContent = {
  proposalContent: string
}

export type ImprovementParams = {
  exact?: boolean
  tone?: Tone
  textLength?: TextLength
  customModelId?: string
}

export type ImprovementReturns = {
  guideText: string
  markdown: string
}
