import { z } from 'zod';

// 1. Verify Email
const createVerifyEmailZodSchema = z.object({
  body: z.object({
    email: z.string().min(1, { message: 'Email is required' }),
    oneTimeCode: z
      .number({ message: 'One time code is required' })
      .int({ message: 'One time code must be an integer' }),
  }),
});

// 2. Login
const createLoginZodSchema = z.object({
  body: z.object({
    email: z.string().min(1, { message: 'Email is required' }),
    password: z.string().min(1, { message: 'Password is required' }),
  }),
});

// 3. Forget Password
const createForgetPasswordZodSchema = z.object({
  body: z.object({
    email: z.string().min(1, { message: 'Email is required' }),
  }),
});

// 4. Reset Password
const createResetPasswordZodSchema = z.object({
  body: z.object({
    newPassword: z.string().min(6, { message: 'Password is required' }),
    confirmPassword: z
      .string()
      .min(6, { message: 'Confirm Password is required' }),
  }),
});

// 5. Change Password
const createChangePasswordZodSchema = z.object({
  body: z.object({
    currentPassword: z
      .string()
      .min(6, { message: 'Current Password is required' }),
    newPassword: z.string().min(6, { message: 'New Password is required' }),
    confirmPassword: z
      .string()
      .min(6, { message: 'Confirm Password is required' }),
  }),
});

export const AuthValidation = {
  createVerifyEmailZodSchema,
  createForgetPasswordZodSchema,
  createLoginZodSchema,
  createResetPasswordZodSchema,
  createChangePasswordZodSchema,
};
