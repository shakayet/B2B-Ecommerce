import { z } from 'zod';

const createUserZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    contact: z.string().min(1, { message: 'Contact is required' }),
    email: z
      .string()
      .min(1, { message: 'Email is required' })
      .refine(val => /^\S+@\S+\.\S+$/.test(val), { message: 'Invalid email' }),
    password: z.string().min(8, { message: 'Password is required' }),
    businessAddress: z.string().min(1, { message: 'Location is required' }),
    profile: z.string().optional(),
  }),
});

const updateUserZodSchema = z.object({
  name: z.string().optional(),
  contact: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  location: z.string().optional(),
  image: z.string().optional(),
});

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
};
