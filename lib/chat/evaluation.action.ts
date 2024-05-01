import { generateTextContents } from '@/lib/chat/generateText'
import {
  EvaluationContent,
  EvaluationParams,
  EvaluationReturns
} from './evaluation.types'
import { PromptGenerator } from '@/lib/chat/PromptGenerator'
import { ProposalEvaluationCategories } from '@/lib/types'

export async function doEvaluate(
  content: EvaluationContent,
  params: EvaluationParams
): Promise<EvaluationReturns> {
  const { customModelId } = params

  const tunedModelId = `tunedModels/${customModelId || process.env.EVALUATION_TUNED_MODEL_ID}`

  console.log(`doEvaluate():`, { tunedModelId }, params)

  const generator = PromptGenerator.generate()
    .insertLine('You are a brilliant proposal professional.')
    .insertLine(
      'Your mission is to evaluate submitted proposal content using the given scoring criteria.'
    )

  generator
    .insertLine('Format the output with following fields by json.')
    .insertLine('This is a sample output:')
    .insertCode(
      JSON.stringify({
        overallScore: 0,
        data: {
          '{{criteria}}': {
            shouldImprove: false,
            score: 4,
            description: '{{reason for the score}}'
          }
        }
      }),
      'json'
    )

  generator
    .insertEmptyLine()
    .insertLine('This is a proposal content:')
    .insertLine('---')
    .insertLine(content.proposalContent)
    .insertLine('---')

  generator
    .insertEmptyLine()
    .insertLine('This is the scoring criteria for the proposal.')
    .insertLine('The score should be a number between 1 to 4.')
    .insertLine('---')
    .insertLine(content.scoringCriteria || defaultScoringCriteria())
    .insertLine('---')

  // generator
  //   .insertEmptyLine()
  //   .insertLine(
  //     'This is context of the proposal. Try to consider this on the content:'
  //   )
  //   .insertLine('---')
  //   .insertLine(content.context || defaultContext())
  //   .insertLine('---')

  const textContent = await generateTextContents({
    modelId: tunedModelId,
    prompt: generator.toString()
  })

  return parseResult(textContent)
}

function defaultContext(): string {
  const generator = PromptGenerator.generate()

  return generator.toString()
}

function defaultScoringCriteria(): string {
  const generator = PromptGenerator.generate()

  generator
    .insertLine(`1. ${ProposalEvaluationCategories.Background}`)
    .insertLine(
      "4 points: Provides a detailed context of project initiation with specific examples and a deep understanding of the client's business model.\n" +
        "3 points: Adequately explains project initiation context and shows a basic understanding of the client's business model.\n" +
        "2 points: Briefly mentions the context with vague references or lacks detail in describing the client's business model.\n" +
        "1 point: Dose not mention project initiation context or client's business model."
    )

  generator
    .insertLine(`2. ${ProposalEvaluationCategories.Goal}`)
    .insertLine(
      '4 points: Presents clearly defined SMART goals with quantifiable success criteria and explicit alignment to project objectives.\n' +
        '3 points: Presents goals with some SMART elements and qualitative success criteria, mostly aligned with project objectives.\n' +
        '2 points: Presents goals that lack specificity, have unmeasurable outcomes, or have unclear alignment with project objectives.\n' +
        '1 point: Does not state clear goals or success criteria.'
    )

  generator
    .insertLine(`3. ${ProposalEvaluationCategories.Specificity}`)
    .insertLine(
      '4 points: Includes a detailed timeline with specific dates, an itemized budget with cost breakdowns, and deliverables with technical specifications clearly aligned to project objectives.\n' +
        '3 points: Provides a timeline with general phases without specific dates, a budget range without detailed components, or deliverables with general or vague descriptions.\n' +
        '2 points: Mentions timeline, budget, and deliverables but lacks specific details, itemization, or clear alignment with project objectives.\n' +
        '1 point: Does not mention timeline, budget, or deliverables.'
    )

  generator
    .insertLine(`4. ${ProposalEvaluationCategories.Specialization}`)
    .insertLine(
      '4 points: Showcases highly relevant industry expertise with detailed examples and outcomes directly related to the project requirements.\n' +
        '3 points: Mentions relevant industry expertise with an example and related experiences, or mentions differentiation points from competition.\n' +
        '2 points: Briefly mentions industry expertise without specific examples or experiences .\n' +
        '1 point: Does not mention industry expertise or experience.'
    )

  generator
    .insertLine(`5. ${ProposalEvaluationCategories.AdditionalValue}`)
    .insertLine(
      '4 points: Includes at least 1 benefit and a detailed collaboration plan outlining specific communication methods and frequencies.\n' +
        '3 points: Provides at least 1 benefit and a simple collaboration plan with some communication details.\n' +
        '2 points: Mentions additional value or collaboration generally, lacking detail on specific methods or structured plans.\n' +
        '1 point: Does not mention additional value or collaboration strategies.'
    )

  generator
    .insertLine(`6. ${ProposalEvaluationCategories.Readability}`)
    .insertLine(
      '4 points: Document uses concise sentences (15-20 words), simple language, and is well-structured for easy navigation.\n' +
        '3 points: Features slightly longer sentences (21-25 words), some complex terms, with generally good structure.\n' +
        '2 points: Includes longer sentences (26-30 words), complex language, and has dense content.\n' +
        '1 point: Comprises overly long sentences (over 30 words), dense paragraphs, and poor structure, making it hard to read.'
    )

  return generator.toString()
}

function parseResult(result: string): EvaluationReturns {
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

  const evaluation = JSON.parse(jsonContent) as EvaluationReturns['evaluation']

  return {
    guideText: result,
    evaluation
  }
}
