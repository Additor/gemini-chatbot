// import { ProposalEvaluation } from '@/lib/types'
// import { EvaluationResult } from './trouble-makers/evaluation-result'

// const dummyProposalEvaluation: ProposalEvaluation = {
//   overallScore: 3.5,
//   data: {
//     Background: {
//       shouldImprove: true,
//       score: 3,
//       description: "you need to add more context about your client's goal."
//     },
//     Goal: {
//       shouldImprove: true,
//       score: 4,
//       description: 'Goals clear, but success criteria could be more detailed.'
//     },
//     Specificity: {
//       shouldImprove: true,
//       score: 3,
//       description: 'Specific but lacks some innovative approaches.'
//     },
//     Expertise: {
//       shouldImprove: true,
//       score: 2,
//       description: 'Expertise in UX/UI shown, broader skills not demonstrated.'
//     },
//     Differentiation: {
//       shouldImprove: true,
//       score: 2,
//       description: 'Lacks unique offerings beyond basic improvements.'
//     },
//     Readability: {
//       shouldImprove: true,
//       score: 3,
//       description: 'Adequate detail but misses strategic depth.'
//     }
//   }
// }

export function EmptyScreen() {
  return (
    <>
      <div className="mx-auto max-w-2xl px-4">
        <div className="flex flex-col gap-2 rounded-2xl bg-zinc-50 sm:p-8 p-4 text-sm sm:text-base">
          <h1 className="text-2xl sm:text-3xl tracking-tight font-semibold max-w-fit inline-block">
            Win More with Smarter Proposals 🧞
          </h1>
          <p className="mb-2 last:mb-0">
            Just enter your proposal, and our AI genie will enhance it for
            maximum impact. Quick, easy, and magical — see your proposals
            transform into winners! ✨
          </p>
        </div>
      </div>
      {/* <EvaluationResult proposalEvaluation={dummyProposalEvaluation} /> */}
    </>
  )
}
