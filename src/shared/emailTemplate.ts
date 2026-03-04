import {
  IAdminApprovalEmail,
  ICreateAccount,
  IInvoicePaymentLinkEmail,
  IResetPassword,
} from '../types/emailTamplate';

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://res.cloudinary.com/doqoiqr33/image/upload/v1771352218/New_Project_2_gwyg9n.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
          <h2 style="color: #004F3B; font-size: 24px; margin-bottom: 20px;">Hey! ${values.name}, Your Toothlens Account Credentials</h2>
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #004F3B; width: 80px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Reset your password',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://res.cloudinary.com/doqoiqr33/image/upload/v1771352218/New_Project_2_gwyg9n.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #004F3B; width: 80px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
                <p style="color: #b9b4b4; font-size: 16px; line-height: 1.5; margin-bottom: 20px;text-align:left">If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};

const adminApprovalEmail = (values: IAdminApprovalEmail) => {
  const data = {
    to: values.email,
    subject: 'Account Approved by Admin',
    html: `
<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
  <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    
    <img 
      src="https://res.cloudinary.com/doqoiqr33/image/upload/v1771352218/New_Project_2_gwyg9n.png" 
      alt="Company Logo" 
      style="display: block; margin: 0 auto 20px; width:150px" 
    />

    <div style="text-align: center;">
      <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Your account has been <strong>successfully approved</strong> by the administrator.
      </p>
      <div style="background-color: #004F3B; width: 120px; padding: 12px; text-align: center; border-radius: 8px; color: #fff; font-size: 24px; letter-spacing: 2px; margin: 20px auto;">
        ${values.title}
      </div>
    </div>

  </div>
</body>
    `,
  };

  return data;
};

const invoicePaymentLinkEmail = (values: IInvoicePaymentLinkEmail) => {
  const data = {
    to: values.email,
    subject: 'Payment Link for Invoice',
    html: `
<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
  <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    
    <img 
      src="https://res.cloudinary.com/doqoiqr33/image/upload/v1771352218/New_Project_2_gwyg9n.png" 
      alt="Company Logo" 
      style="display: block; margin: 0 auto 20px; width:150px" 
    />

    <div style="text-align: center;">
      <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Your invoice <strong>${values.invoiceNumber}</strong> is ready for payment.
      </p>
      <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Please click the button below to proceed with payment:
      </p>
      <a href="${values.paymentLink}" target="_blank" style="display:inline-block;background-color:#004F3B;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:bold;">Pay Now</a>
    </div>

  </div>
</body>
    `,
  };

  return data;
};



export const emailTemplate = {
  createAccount,
  resetPassword,
  adminApprovalEmail,
  invoicePaymentLinkEmail
};
