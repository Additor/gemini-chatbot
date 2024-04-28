import { Message } from 'ai'

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export interface Session {
  user: {
    id: string
    email: string
  }
}

export interface AuthResult {
  type: string
  message: string
}

export interface User extends Record<string, any> {
  id: string
  email: string
  password: string
  salt: string
}

export const TextLengths = {
  Simple: 'Simple',
  Moderate: 'Moderate',
  Detailed: 'Detailed'
} as const

export type TextLength = keyof typeof TextLengths

export const Tones = {
  Professional: 'Professional',
  Formal: 'Formal',
  Confident: 'Confident',
  Innovative: 'Innovative',
  Analytical: 'Analytical',
  Technical: 'Technical',
  Optimistic: 'Optimistic',
  Friendly: 'Friendly',
  'Problem-Solving': 'Problem-Solving',
  Trustworthy: 'Trustworthy',
  Ambitiou: 'Ambitious'
} as const

export type Tone = keyof typeof Tones

export const ProposalEvaluationCategories = {
  Background: 'Background',
  Goal: 'Goal',
  Specificity: 'Specificity',
  Expertise: 'Expertise',
  Differentiation: 'Differentiation',
  Readability: 'Readability'
} as const

export type ProposalEvaluationCategory =
  keyof typeof ProposalEvaluationCategories

export type ProposalEvaluationData = {
  shouldImprove: boolean
  score: number
  description: string
}

export type ProposalEvaluation = {
  overallScore: number
  data: Record<ProposalEvaluationCategory, ProposalEvaluationData>
}
