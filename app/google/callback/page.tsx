'use server'

import {redirect} from 'next/navigation'
import {getTokens} from "@/lib/chat/OAuth";

export default async function GoogleCallbackPage(request: any) {
  const code = request.searchParams.code;

  const credentials = await getTokens(code);
  console.log('Google Credentials:', JSON.stringify(credentials));


  redirect('/')
}
