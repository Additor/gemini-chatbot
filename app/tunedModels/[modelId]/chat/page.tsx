import { type Metadata } from 'next'

import {nanoid} from '@/lib/utils'
import {getMissingKeys} from '@/app/actions'
import { AI } from '@/lib/chat/actions'
import {Chat} from "@/components/chat";

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
      <AI initialAIState={{ chatId: id, interactions: [], messages: [], modelId }}>
        <Chat id={id} missingKeys={missingKeys} />
      </AI>
    </>
  )
}
