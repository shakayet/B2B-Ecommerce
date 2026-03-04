import { AuthorizationCode } from "simple-oauth2";

const oauth2Client = new AuthorizationCode({
  client: { id: process.env.QB_CLIENT_ID!, secret: process.env.QB_CLIENT_SECRET! },
  auth: {
    tokenHost: "https://oauth.platform.intuit.com",
    authorizePath: "/oauth2/v1/tokens/bearer",
    tokenPath: "/oauth2/v1/tokens/bearer",
  }
});

export const getTokenFromCode = async (code: string) => {
  if (!process.env.QB_REDIRECT_URI) throw new Error("QB_REDIRECT_URI not set");
  const token = await oauth2Client.getToken({ code, redirect_uri: process.env.QB_REDIRECT_URI });
  return token.token;
};
