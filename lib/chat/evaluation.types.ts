import { ProposalEvaluation } from '@/lib/types'

export type EvaluationContent = {
  proposalFromUser: string
  context?: string
  scoringCriteria?: string
}

export type EvaluationParams = {
  exact?: boolean
}

export type EvaluationReturns = {
  guideText: string
  evaluation: ProposalEvaluation
}
