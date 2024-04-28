import { type Metadata } from 'next'

import {nanoid} from '@/lib/utils'
import {getMissingKeys} from '@/app/actions'
import { AI } from '@/lib/chat/actions'
import {Chat} from "@/components/chat";
import {Badge} from "@/components/ui/badge";

interface ModelPageProps {
  params: {
    modelId: string
  }
}

export async function generateMetadata({
  params
}: ModelPageProps): Promise<Metadata> {
  return {
    title: 'Tuned Model Chat'
  }
}

export default async function TunedModelPage({ params }: ModelPageProps) {
  const id = nanoid()
  const missingKeys = await getMissingKeys()

  const modelId = params.modelId;
  return (
    <>
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col gap-4 rounded-2xl bg-zinc-50 sm:p-8 p-4 text-sm sm:text-base">
          <h1>
            <b>Tuned Model Test Page</b>
          </h1>
          <div className="flex gap-4">
            <div className="text-sm text-zinc-600">
              Model ID:
              <Badge variant="secondary">
                tunedModels/{params.modelId}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <AI initialAIState={{ chatId: id, interactions: [], messages: [], modelId }}>
        <Chat id={id} missingKeys={missingKeys} />
      </AI>
    </>
  )
}
