import { generateTextContents } from '@/lib/chat/generateText'
import {
  ImprovementContent,
  ImprovementParams,
  ImprovementReturns
} from './improvement.types'

export async function doImprove(
  content: ImprovementContent,
  param: ImprovementParams
): Promise<ImprovementReturns> {
  const tunedModelId = `tunedModels/${process.env.IMPROVEMENT_TUNED_MODEL_ID}`
  console.log({ tunedModelId })

  const prompt = [].join('===\n')

  const textContent = await generateTextContents({
    modelId: tunedModelId,
    prompt
  })

  return parseResult(textContent)
}

function parseResult(result: string): ImprovementReturns {
  return {
    guideText: '',
    markdown: ''
  }
}
