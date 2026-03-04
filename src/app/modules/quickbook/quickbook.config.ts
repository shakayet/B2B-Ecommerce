import axios from 'axios';
import qs from 'querystring';
import { randomBytes } from 'crypto';
import config from '../../../config';
import { th } from 'zod/v4/locales';

export class QuickBooksConfig {
  private static instance: QuickBooksConfig;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private environment: 'sandbox' | 'production';
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private realmId: string | null = null;
  private tokenExpiresAt: Date | null = null;

  private constructor() {
    this.clientId = config.quickbooks.clientId;
    this.clientSecret = config.quickbooks.clientSecret;
    this.redirectUri = config.quickbooks.redirectUri;
    this.environment = config.quickbooks.environment as 'sandbox' | 'production';
  }

  static getInstance(): QuickBooksConfig {
    if (!QuickBooksConfig.instance) {
      QuickBooksConfig.instance = new QuickBooksConfig();
    }
    return QuickBooksConfig.instance;
  }

  getAuthUrl(userId: string): string {
        const state = Buffer
      .from(JSON.stringify({ userId }))
      .toString('base64');
    const baseUrl = 'https://appcenter.intuit.com/connect/oauth2';
    
    const params = {
      client_id: this.clientId,
      response_type: 'code',
      scope: 'com.intuit.quickbooks.accounting',
      redirect_uri: this.redirectUri,
      state
    };

    return `${baseUrl}?${qs.stringify(params)}`;
  }

  async getAccessToken(authCode: string): Promise<any> {
    const tokenUrl = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    try {
      const response = await axios.post(tokenUrl, 
        qs.stringify({
          grant_type: 'authorization_code',
          code: authCode,
          redirect_uri: this.redirectUri
        }),
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      this.tokenExpiresAt = new Date(Date.now() + response.data.expires_in * 1000);
      this.realmId = response.data.realmId;

      return response.data;
    } catch (error) {
      console.error('Error getting QuickBooks access token:', error);
      throw error;
    }
  }

async refreshAccessToken(refreshToken: string) {
  try {
    const url = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';

    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString('base64');

    const response = await axios.post(
      url,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      '❌ Refresh token error:',
      error?.response?.data || error
    );

    throw new Error('QuickBooks token refresh failed');
  }
}


  getBaseUrl(realmId: string): string {
    if (!realmId) throw new Error('No realm ID available');
    
    if (this.environment === 'sandbox') {
      return `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}`;
    }
    return `https://quickbooks.api.intuit.com/v3/company/${realmId}`;
  }

  async getHeaders(realmId: string, accessToken: string): Promise<{ [key: string]: string }> {
    if (!accessToken) throw new Error('No access token available');
    
    // Check if token is expired and refresh if needed
    if (this.tokenExpiresAt && this.tokenExpiresAt < new Date()) {
      await this.refreshAccessToken(this.refreshToken!);
    }
    
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  setTokens(accessToken: string, refreshToken: string, realmId: string, expiresIn: number) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.realmId = realmId;
    this.tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
  }

  isConnected(): boolean {
    return !!(this.accessToken && this.realmId);
  }
}