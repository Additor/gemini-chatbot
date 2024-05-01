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

  generator
    .insertLine('Format the output by json.')
    .insertLine('This is a sample output:')
    .insertCode(
      JSON.stringify({
        markdown: '{{improved content as markdown}}'
      }),
      'json'
    )

  generator
    .insertEmptyLine()
    .insertLine('This is an original proposal content to be changed:')
    .insertLine('---')
    .insertLine(content.proposalContent)
    .insertLine('---')

  generator
    .insertEmptyLine()
    .insertLine('Improving factors:')
    .insertLine('---')
    .insertLine(`- Text Length: ${textLength}`)
    .insertLine(`- Tone: ${tone}`)
    .insertLine('---')

  const textContent = await generateTextContents({
    modelId: tunedModelId,
    prompt: generator.toString()
  })

  return parseResult(textContent)
}

function parseResult(result: string): ImprovementReturns {
  const splitted = result.trim().split('```')

  let jsonContent: string
  if (splitted.length === 1) {
    jsonContent = splitted[0]
  } else {
    const found = splitted.find(content => content.startsWith('json'))
    if (!found) {
      throw new Error('Invalid response from Generation')
    }
    jsonContent = found
  }
  jsonContent = jsonContent.trim().substring('json'.length)

  console.log('=== JSON === ')
  console.log(jsonContent)
  console.log('=== ==== === ')

  const { markdown } = JSON.parse(jsonContent) as ImprovementReturns

  return {
    guideText: result,
    markdown
  }
}
