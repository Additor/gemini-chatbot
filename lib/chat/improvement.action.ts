import { generateTextContents } from '@/lib/chat/generateText'
import {
  ImprovementContent,
  ImprovementParams,
  ImprovementReturns
} from './improvement.types'
import { PromptGenerator } from '@/lib/chat/PromptGenerator'

export async function doImprove(
  content: ImprovementContent,
  params?: ImprovementParams
): Promise<ImprovementReturns> {
  const tunedModelId = `tunedModels/${process.env.IMPROVEMENT_TUNED_MODEL_ID}`

  console.log(`doImprove():`, { tunedModelId }, params)

  const generator = PromptGenerator.generate()
    .insertLine('You are a brilliant proposal professional.')
    .insertLine(
      'Your mission is helping to improve submitted proposal content using the given scoring criteria.'
    )

  generator
    .insertLine('Format the output with following fields by json.')
    .insertLine('This is a sample output:')
    .insertCode(
      JSON.stringify({
        markdown: '{{improved content styled with markdown}}'
      }),
      'json'
    )

  generator
    .insertEmptyLine()
    .insertLine('This is an original proposal content to be changed:')
    .insertLine('===')
    .insertLine(content.proposalData)
    .insertLine('===')

  generator
    .insertEmptyLine()
    .insertLine('Factors to be improved:')
    .insertLine('===')
    .insertLine(`- Text Length: ${params?.textLength}`)
    .insertLine(`- Tone: ${params?.tone}`)
    .insertLine('===')

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
  jsonContent = jsonContent.trim().substring('json'.length).replaceAll('\n', '')

  const { markdown } = JSON.parse(jsonContent) as ImprovementReturns

  return {
    guideText: 'Improvement 결과입니다:\n' + result,
    markdown
  }
}
