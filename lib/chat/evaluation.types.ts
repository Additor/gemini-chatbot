import { ProposalEvaluation } from '@/lib/types'

export type EvaluationContent = {
  proposalContent: string
  context?: string
  scoringCriteria?: string
}

export type EvaluationParams = {
  exact?: boolean
  customModelId?: string
}

export type EvaluationReturns = {
  guideText: string
  evaluation: ProposalEvaluation
}
