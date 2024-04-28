import { redirect } from 'next/navigation'
import {getRedirectUrl} from "@/lib/chat/OAuth";


export default async function GoogleOAuthPage() {
  const state= 'DYo1eb4FHPQw5IDG7GcnqpXkGubUAZ';

  const redirectUrl = await getRedirectUrl();

  redirect(redirectUrl);

  // return (
  //   <main className="flex flex-col p-4">
  //     <LoginForm />
  //   </main>
  // )
}
