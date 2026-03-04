import axios from 'axios';
import { QuickBooksConfig } from './quickbook.config';
import { IUser } from '../user/user.interface';
import { IOrder } from '../order/order.interface';
import { IProduct } from '../product.catelog/product.interface';
import { QuickBooksToken } from './quickbooksToken.model';
const quickbookConfig = QuickBooksConfig.getInstance();
export class QuickBooksService {
  private qbConfig: QuickBooksConfig;

  constructor() {
    this.qbConfig = QuickBooksConfig.getInstance();
  }

  /**
   * Ensure a valid access token for the user
   */
  async getValidToken() {
    // Find token in DB
    const token = await QuickBooksToken.findOne();
    if (!token) throw new Error('QuickBooks not connected');

    // Refresh token if expired
    if (token.expiresAt < new Date()) {
      if (!this.qbConfig.refreshAccessToken) {
        throw new Error('QuickBooksConfig does not expose refreshAccessToken method');
      }

      // Call refresh method safely
      const refreshed = await this.qbConfig.refreshAccessToken(token.refreshToken);
      if (!refreshed || !refreshed.access_token) {
        throw new Error('Failed to refresh QuickBooks token');
      }

      token.accessToken = refreshed.access_token;
      token.refreshToken = refreshed.refresh_token || token.refreshToken; // keep old if undefined
      token.expiresAt = new Date(Date.now() + (refreshed.expires_in || 3600) * 1000);
      await token.save();
    }

    return token;
  }

  // =====================================================
  // ✅ CREATE OR GET CUSTOMER
  // =====================================================

  async createCustomer(
    user: IUser,
    realmId: string,
    accessToken: string
  ): Promise<string> {

    if (!realmId || !accessToken) {
      throw new Error('QuickBooks realmId or accessToken is missing');
    }

    try {
      const baseUrl = this.qbConfig.getBaseUrl(realmId);
      const headers = await this.qbConfig.getHeaders(realmId, accessToken);

      // ----------------------------
      // Split user name safely
      // ----------------------------

      const nameParts = (user.name || '').split(' ');
      const givenName = nameParts[0] || 'N/A';
      const familyName = nameParts[1] || 'N/A';

      const displayName =
        user.businessName || `${givenName} ${familyName}`;

      // =================================================
      // ✅ STEP 1: SEARCH EXISTING CUSTOMER
      // =================================================

      const query = `
        SELECT * FROM Customer
        WHERE DisplayName = '${displayName.replace(/'/g, "\\'")}'
      `;

      const searchResponse = await axios.get(
        `${baseUrl}/query?query=${encodeURIComponent(query)}`,
        { headers }
      );

      const existingCustomer =
        searchResponse.data?.QueryResponse?.Customer?.[0];

      if (existingCustomer) {
        console.log(
          '✅ Customer already exists:',
          existingCustomer.Id
        );
        return existingCustomer.Id;
      }

      // =================================================
      // ✅ STEP 2: CREATE CUSTOMER
      // =================================================

      const customerData: any = {
        DisplayName: displayName,
        GivenName: givenName,
        FamilyName: familyName,
        Active: user.isActive === 'active',
        PrimaryEmailAddr: {
          Address: user.email || 'no-reply@example.com',
        },
        Taxable: true,
      };

      // Optional fields

      if (user.businessType) {
        customerData.Title = user.businessType?.slice(0, 16); // QuickBooks Title max length is 50 chars
      }

      if (user.contact) {
        customerData.PrimaryPhone = {
          FreeFormNumber: user.contact,
        };
      }

      if (user.businessAddress) {
        customerData.BillAddr = {
          Line1: user.businessAddress,
          City: user.city || 'N/A',
          Country: user.country || 'USA',
          PostalCode: user.postalCode || '00000',
        };

        customerData.ShipAddr = {
          Line1: user.businessAddress,
          City: user.city || 'N/A',
          Country: user.country || 'USA',
          PostalCode: user.postalCode || '00000',
        };
      }

      if (user.customerType || user.status) {
        customerData.Notes =
          `Customer Type: ${user.customerType || 'N/A'}, ` +
          `Status: ${user.status || 'N/A'}`;
      }

      const createResponse = await axios.post(
        `${baseUrl}/customer`,
        customerData,
        { headers }
      );

      const customerId =
        createResponse.data?.Customer?.Id;

      if (!customerId) {
        console.error(
          'Invalid QuickBooks response:',
          createResponse.data
        );
        throw new Error(
          'Invalid response from QuickBooks'
        );
      }

      console.log(
        '✅ Customer created successfully:',
        customerId
      );

      return customerId;

    } catch (error: any) {

      if (axios.isAxiosError(error)) {
        console.error(
          '❌ QuickBooks API error:',
          JSON.stringify(error.response?.data, null, 2)
        );
      } else {
        console.error('❌ Unknown error:', error);
      }

      throw new Error(
        'Failed to create customer in QuickBooks'
      );
    }
  }


   async createItem(product:IProduct, realmId: string, accessToken: string): Promise<string> {
    try {
      const url = `${this.qbConfig.getBaseUrl(realmId)}/item`;
      const headers = await this.qbConfig.getHeaders(realmId, accessToken);
      
      const itemData = {
        Name: product.sku,
        Sku: product.sku,
        Description: product.description,
        Active: product.isActive,
        Taxable: true,
        UnitPrice: product.basePrice || 0,
        Type: 'Inventory',
        IncomeAccountRef: {
          name: 'Sales',
          value: '79' // Default sales account ID
        },
        AssetAccountRef: {
          name: 'Inventory Asset',
          value: '81' // Default inventory asset account ID
        },
        ExpenseAccountRef: {
          name: 'Cost of Goods Sold',
          value: '80' // Default COGS account ID
        }
      };

      const response = await axios.post(url, itemData, { headers });
      return response.data.Item.Id;
    } catch (error) {
      console.error('Error creating QuickBooks item:', error);
      throw new Error('Failed to create item in QuickBooks');
    }
  }


  async createInvoice(order: IOrder, user: IUser, realmId: string, accessToken: string): Promise<any> {
    try {
      const url = `${this.qbConfig.getBaseUrl(realmId)}/invoice`;
      const headers = await this.qbConfig.getHeaders(realmId, accessToken);
      const invoiceData = {
        CustomerRef: {
          value: user.quickbooksId
        },

        Line: [
          ...order.items.map(item => ({
            Amount: item.totalPrice,
            DetailType: 'SalesItemLineDetail',
            SalesItemLineDetail: {
              ItemRef: {
                value: item.quickbooksItemId
              },
              UnitPrice: item.unitPrice,
              Qty: item.quantity
            },
            Description: item.name
          })),

          {
            DetailType: 'SubTotalLineDetail'
          }
        ],

        TxnDate: new Date().toISOString().split('T')[0],
        DueDate: order.dueDate.toISOString().split('T')[0],

        BillEmail: {
          Address: user.email
        },

        BillAddr: order.billingAddress && {
          Line1: order.billingAddress.line1 || '',
          City: order.billingAddress.city || '',
          CountrySubDivisionCode: order.billingAddress.state || '',
          PostalCode: order.billingAddress.postalCode || '',
          Country: order.billingAddress.country || 'US'
        },

        ShipAddr: order.shippingAddress && {
          Line1: order.shippingAddress.line1 || '',
          City: order.shippingAddress.city || '',
          CountrySubDivisionCode: order.shippingAddress.state || '',
          PostalCode: order.shippingAddress.postalCode || '',
          Country: order.shippingAddress.country || 'US'
        },

        PrivateNote: order.notes || '',

        AllowOnlinePayment: true,
        AllowOnlineCreditCardPayment: true,
        AllowOnlineACHPayment: true
      };

      const response = await axios.post(url, invoiceData, { headers });
      const invoiceId = response.data.Invoice.Id;
      const invoiceNumber = response.data.Invoice.DocNumber;

      const paymentLink = await this.createPaymentLink(invoiceId, realmId, accessToken);

      return { invoiceId, invoiceNumber, paymentLink };
    } catch (error:any) {
      console.error('Error creating QuickBooks invoice:', error.response?.data || error.message);
      throw new Error('Failed to create invoice in QuickBooks');
    }
  }


async createPaymentLink(
  invoiceId: string,
  realmId: string,
  accessToken: string
): Promise<string> {
  try {
    const url = `${this.qbConfig.getBaseUrl(realmId)}/invoice/${invoiceId}`;
    console.log('Fetching invoice details...', url);

    const headers = await this.qbConfig.getHeaders(
      realmId,
      accessToken
    );

    const response = await axios.get(url, { headers });
    const invoice = response.data.Invoice;

    // ✅ Production link (real payment)
    if (invoice?.OnlineInvoiceUrl) {
      return invoice.OnlineInvoiceUrl;
    }

    // ✅ Sandbox fallback preview link
    if (invoice?.InvoiceLink) {
      console.warn(
        '⚠️ Sandbox preview link used (real payments not supported)'
      );
      return invoice.InvoiceLink;
    }

    // ❌ No link at all
    console.warn('No payment link available');
    return '';
  } catch (error: any) {
    console.error(
      'Error fetching QuickBooks payment link:',
      error?.response?.data || error
    );

    // ❗ IMPORTANT: do NOT throw error
    return '';
  }
}

  async getInvoice(invoiceId: string, realmId: string, accessToken: string): Promise<any> {
    try {
      const url = `${this.qbConfig.getBaseUrl(realmId)}/invoice/${invoiceId}`;
      const headers = await this.qbConfig.getHeaders(realmId, accessToken);
      
      const response = await axios.get(url, { headers });
      return response.data.Invoice;
    } catch (error) {
      console.error('Error getting QuickBooks invoice:', error);
      throw new Error('Failed to get invoice from QuickBooks');
    }
  }

  async checkInvoicePayment(invoiceId: string, realmId: string, accessToken: string): Promise<boolean> {
    try {
      const invoice = await this.getInvoice(invoiceId, realmId, accessToken);
      return invoice.Balance === 0;
    } catch (error) {
      console.error('Error checking invoice payment:', error);
      throw error;
    }
  }

  // async updateInvoiceStatus(invoiceId: string, status: string): Promise<void> {
  //   try {
  //     const url = `${this.qbConfig.getBaseUrl()}/invoice/${invoiceId}`;
  //     const headers = await this.qbConfig.getHeaders();
      
  //     const updateData = {
  //       Id: invoiceId,
  //       SyncToken: await this.getSyncToken(invoiceId),
  //       sparse: true,
  //       PrivateNote: `Status updated to ${status}`
  //     };

  //     await axios.post(url, updateData, { headers });
  //   } catch (error) {
  //     console.error('Error updating invoice status:', error);
  //     throw new Error('Failed to update invoice status');
  //   }
  // }

  private async getSyncToken(invoiceId: string, realmId: string, accessToken: string): Promise<string> {
    const invoice = await this.getInvoice(invoiceId, realmId, accessToken);
    return invoice.SyncToken;
  }

}


const testConnection = async (accessToken: string, realmId: string) => {
  try {
    const response = await axios.get(
       `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/companyinfo/${realmId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    console.log('Success:', response.data);
    return response.data;

  } catch (error: any) {
    console.error('QB ERROR STATUS:', error.response?.status);
    console.error('QB ERROR DATA:', error.response?.data);
    throw error;
  }
};


export const checkQuickBooksConnection = async (userId: string) => {
  const token = await QuickBooksToken.findOne({ userId });

  if (!token) {
    return { isConnected: false, isWorking: false };
  }

  // Refresh if expired
  if (new Date() >= token.expiresAt) {
    const refreshed = await quickbookConfig.refreshAccessToken(
      token.refreshToken
    );

    token.accessToken = refreshed.access_token;
    token.expiresAt = new Date(
      Date.now() + refreshed.expires_in * 1000
    );

    await token.save();
  }

  try {
    await testConnection(token.accessToken, token.realmId);

    return {
      isConnected: true,
      isWorking: true,
    };
  } catch {
    return {
      isConnected: true,
      isWorking: false,
    };
  }
};
