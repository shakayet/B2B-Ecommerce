import 'express-session';

declare module 'express-session' {
  interface SessionData {
    qbAccessToken?: string;
    realmId?: string;
  }
}
