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
      'Requirements: Clear understanding and reflection of specific client requirements. (e.g. Target audience, constraints, product or deliverable specifications) Clearly defined expected outcomes of the project. (e.g. Project scope, details, services to be provided, references) Defined stages of project progression with specific milestones. (e.g. Concept development, design completion, launch, post-launch management). Clearly defined budget range provided by the client.'
    )

  generator
    .insertLine(`2. ${ProposalEvaluationCategories.Goal}`)
    .insertLine(
      "Clarity in the purpose and objectives of the project based on understanding of client's basic business model and key business areas. Defined criteria for success and potential failure factors. (e.g. Revenue increase, market share expansion, customer satisfaction, quality standards) Understanding the context and reasons for project initiation. (e.g. New market entry, competition intensification, regulatory changes)"
    )

  generator
    .insertLine(`3. ${ProposalEvaluationCategories.Specificity}`)
    .insertLine(
      'Detailed description of how the solution contributes to achieving business objectives.'
    )

  generator
    .insertLine(`4. ${ProposalEvaluationCategories.Expertise}`)
    .insertLine(
      "Expertise and experience in specific industry sectors or project types showcased. Demonstrating reliability through detailed examples of past performances. Presentation of the portfolio in a way that appeals to the client's needs in satisfying requirements. Clear explanation of expertise superiority over competitors."
    )

  generator
    .insertLine(`5. ${ProposalEvaluationCategories.Differentiation}`)
    .insertLine(
      'Proposed methods for effective collaboration within the client organization. (Plans and methods for maintaining ongoing communication with the client during the project.) , Additional value proposed if pricing competitiveness is low, such as after-sales service or future discounts.'
    )

  generator
    .insertLine(`6. ${ProposalEvaluationCategories.Readability}`)
    .insertLine(
      '6-1. Proposal length: the number of pages considering total content volume, complexity, and target audience. (a4 5-7 page is proper)'
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
