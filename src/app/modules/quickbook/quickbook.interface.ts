export interface IQuickBooksToken {
  accessToken: string;
  refreshToken: string;
  realmId: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface IQuickBooksCustomer {
  Id: string;
  DisplayName: string;
  GivenName: string;
  FamilyName: string;
  PrimaryEmailAddr: { Address: string };
  PrimaryPhone: { FreeFormNumber: string };
}

export interface IQuickBooksInvoice {
  Id: string;
  DocNumber: string;
  TxnDate: string;
  DueDate: string;
  TotalAmt: number;
  Balance: number;
  CustomerRef: { value: string };
}