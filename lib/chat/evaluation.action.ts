import { generateTextContents } from '@/lib/chat/generateText'
import {
  EvaluationContent,
  EvaluationParams,
  EvaluationReturns
} from './evaluation.types'

export async function doEvaluate(
  content: EvaluationContent,
  params: EvaluationParams
): Promise<EvaluationReturns> {
  const tunedModelId = `tunedModels/${process.env.EVALUATION_TUNED_MODEL_ID}`
  console.log({ tunedModelId })

  const prompt = [].join('===\n')

  const textContent = await generateTextContents({
    modelId: tunedModelId,
    prompt
  })

  return parseResult(textContent)
}

function parseResult(result: string): EvaluationReturns {
  return {
    guideText: '',
    evaluation: {
      overallScore: 0,
      data: {} as EvaluationReturns['evaluation']['data']
    }
  }
}
