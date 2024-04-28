import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { IconChevronDown } from '@tabler/icons-react'
import { Children } from 'react'
import { ProposalEvaluation, TextLengths, Tones } from '@/lib/types'

const dummyProposalEvaluation: ProposalEvaluation = {
  overallScore: 3.5,
  data: {
    Background: {
      shouldImprove: false,
      score: 3,
      description: "you need to add more context about your client's goal."
    },
    Goal: {
      shouldImprove: false,
      score: 4,
      description: 'Goals clear, but success criteria could be more detailed.'
    },
    Specificity: {
      shouldImprove: false,
      score: 3,
      description: 'Specific but lacks some innovative approaches.'
    },
    Expertise: {
      shouldImprove: false,
      score: 2,
      description: 'Expertise in UX/UI shown, broader skills not demonstrated.'
    },
    Differentiation: {
      shouldImprove: false,
      score: 2,
      description: 'Lacks unique offerings beyond basic improvements.'
    },
    Readability: {
      shouldImprove: false,
      score: 3,
      description: 'Adequate detail but misses strategic depth.'
    }
  }
}

function getOverallScoreLabel(overallScore: number): string {
  if (overallScore >= 4) {
    return 'Good'
  }

  if (overallScore >= 3) {
    return 'Moderate'
  }

  return 'Bad'
}

export function EmptyScreen() {
  const tableData = Object.entries(dummyProposalEvaluation.data)
  const isAllChecked = tableData.every(([, { shouldImprove }]) => shouldImprove)

  const handleCheckAllCategory = (): void => {
    // TODO: check update all
  }

  const handleCheckCategoryItem = (): void => {
    // TODO: check update item
  }

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-2xl bg-zinc-50 sm:p-8 p-4 text-sm sm:text-base">
        <h6>Overall score</h6>
        <div className="flex gap-4">
          <h1 className="text-2xl sm:text-3xl tracking-tight font-semibold max-w-fit inline-block">
            {dummyProposalEvaluation.overallScore} / 5
          </h1>
          <Badge variant="secondary">
            {getOverallScoreLabel(dummyProposalEvaluation.overallScore)}
          </Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[46px]">
                <Checkbox
                  checked={isAllChecked}
                  onChange={handleCheckAllCategory}
                />
              </TableHead>
              <TableHead className="w-[90px]">Category</TableHead>
              <TableHead className="w-[60px]">Score</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Children.toArray(
              tableData.map(
                ([category, { score, description, shouldImprove }]) => (
                  <TableRow>
                    <TableCell>
                      <Checkbox
                        checked={shouldImprove}
                        onChange={handleCheckCategoryItem}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{category}</TableCell>
                    <TableCell className="font-medium">{score} / 5</TableCell>
                    <TableCell>{description}</TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
        <div className="flex gap-3 mt-2">
          <Button>✨ Improve my proposal</Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Settings</Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              side="top"
              sideOffset={8}
              className="w-96"
            >
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    to create the improved proposal content
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="width" className="w-20">
                      Text Length
                    </Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {TextLengths.Moderate}
                          <IconChevronDown size={20} color="#71717A" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem className="flex-col items-start">
                          <p>{TextLengths.Simple}</p>
                          <p className="text-xs" style={{ color: '#8C8F94' }}>
                            1-2 paragraphs (around 15-70 words)
                          </p>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex-col items-start">
                          <p>{TextLengths.Moderate}</p>
                          <p className="text-xs" style={{ color: '#8C8F94' }}>
                            2-3 paragraphs (around 70-120 words)
                          </p>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex-col items-start">
                          <p>{TextLengths.Detailed}</p>
                          <p className="text-xs" style={{ color: '#8C8F94' }}>
                            3+ paragraphs (around 120-170 words)
                          </p>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="maxWidth" className="w-20">
                      Tone
                    </Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {Tones.Professional}
                          <IconChevronDown size={20} color="#71717A" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {Children.toArray(
                          Object.values(Tones).map(tone => (
                            <DropdownMenuItem>{tone}</DropdownMenuItem>
                          ))
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
