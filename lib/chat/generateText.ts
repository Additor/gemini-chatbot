'use server'

import { experimental_generateText } from 'ai'
import { google } from 'ai/google'
import { getFixedAccessToken } from '@/lib/chat/OAuth'

export async function generateTextContents({
  modelId,
  prompt
}: {
  modelId: string
  prompt: string
}): Promise<string> {
  if (!modelId) {
    throw new Error('modelId is not set')
  }

  const { getFixedAccessToken } = require('@/lib/chat/OAuth')
  try {
    const accessToken = await getFixedAccessToken()
    return requestToGenerateText({
      accessToken,
      modelId,
      prompt
    })
  } catch (error) {
    console.error('Generate Error:', error)

    const accessToken = await getFixedAccessToken(true)
    return requestToGenerateText({
      accessToken,
      modelId,
      prompt
    })
  }
}

async function requestToGenerateText({
  accessToken,
  modelId,
  prompt
}: {
  accessToken: string
  modelId: string
  prompt: string
}): Promise<string> {
  const projectId = process.env.PROJECT_ID
  if (!projectId) {
    throw new Error('PROJECT_ID is not set')
  }

  const model = google.generativeAI(modelId)
  model['config'].headers = function () {
    return {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'x-goog-user-project': projectId
    }
  }

  console.info('=== Generating Text Started ===')
  console.info('- Prompt: \n', prompt)

  const result = await experimental_generateText({
    model,
    temperature: 0,
    prompt
  })

  console.info('- Result: \n', result.text)
  console.info('=== Generating Text Ended ===')

  return result.text
}
