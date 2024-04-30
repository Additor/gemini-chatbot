import { TextLength, Tone } from '@/lib/types'

export type ImprovementContent = {
  proposalData: string
}

export type ImprovementParams = {
  exact?: boolean
  tone: Tone
  textLength: TextLength
}

export type ImprovementReturns = {
  guideText: string
  markdown: string
}
