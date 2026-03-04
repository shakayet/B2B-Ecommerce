export type ICreateAccount = {
  name: string;
  email: string;
  otp: number;
};

export type IResetPassword = {
  email: string;
  otp: number;
};

export type IAdminApprovalEmail = {
  email: string;
  title: string;
};


export type IInvoicePaymentLinkEmail = {
  email: string;
  orderNumber: string;
  invoiceNumber: string;
  paymentLink: string;
};