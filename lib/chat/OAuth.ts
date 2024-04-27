'use server'

import {OAuth2Client, Credentials} from "google-auth-library";

function getOAuthClient(): OAuth2Client {
  return new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL,
  );
}

export async function getRedirectUrl(): Promise<string> {
  const oauthClient = getOAuthClient();

  return oauthClient.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/generative-language.tuning',
    ],
  });
}

export async function getTokens(code: string): Promise<Credentials> {
  const oauthClient = getOAuthClient();

  const result = await oauthClient.getToken(code);

  console.log('Tokens:', result.tokens);

  return result.tokens;
}


export async function refreshFixedTokens(): Promise<Credentials> {
  const oauthClient = getOAuthClient();

  const credentials = JSON.parse(process.env.CREDENTIALS as string);
  oauthClient.setCredentials(credentials);

  const { credentials: nextCredentials } = await oauthClient.refreshAccessToken();
  return nextCredentials;
}


let accessToken: string | undefined;
export async function getFixedAccessToken(forceToRefresh: boolean = false): Promise<string> {
  if (forceToRefresh || !accessToken) {
    const credentials = await refreshFixedTokens();
    if (!credentials.access_token) {
      throw new Error('Failed to get access token');
    }

    accessToken = credentials.access_token;
  }
  return accessToken;
}

