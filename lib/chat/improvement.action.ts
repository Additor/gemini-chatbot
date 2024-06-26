import { generateTextContents } from '@/lib/chat/generateText'
import {
  ImprovementContent,
  ImprovementParams,
  ImprovementReturns
} from './improvement.types'
import { PromptGenerator } from '@/lib/chat/PromptGenerator'

export async function doImprove(
  content: ImprovementContent,
  params: ImprovementParams
): Promise<ImprovementReturns> {
  const { textLength, tone, customModelId } = params

  const tunedModelId = `tunedModels/${customModelId || process.env.IMPROVEMENT_TUNED_MODEL_ID}`

  console.log(`doImprove():`, { tunedModelId }, params)

  const generator = PromptGenerator.generate()
    .insertLine('You are a brilliant proposal professional.')
    .insertLine(
      'Your mission is helping to improve submitted proposal content with improving factors according to the given scoring criteria.'
    )
    .insertLine(
      'Strive to improve to a perfect score on selected evaluation criteria.'
    )
    .insertLine(
      'Before providing content, ensure the improved proposal is professional, and optimized to achieve the highest possible evaluation scores and win rates. If the score dropped, try improving again the content again instead of providing it.'
    )
    .insertLine('ONLY PROVIDE AN IMPROVED PROPOSAL!')

  generator.insertLine('Format the output by markdown.')

  generator
    .insertEmptyLine()
    .insertLine('Improving factors:')
    .insertLine('---')
    .insertLine(`- Text Length: ${textLength}`)
    .insertLine(`- Tone: ${tone}`)
    .insertLine('---')

  generator
    .insertEmptyLine()
    .insertLine('This is an original proposal content to be changed:')
    .insertLine('---')
    .insertLine(content.proposalContent)
    .insertLine('---')

  const textContent = await generateTextContents({
    modelId: tunedModelId,
    prompt: generator.toString()
  })

  return parseResult(textContent)
}

function parseResult(markdown: string): ImprovementReturns {
  return {
    guideText: 'Here is the improved version!✨',
    markdown: markdown
  }
}
