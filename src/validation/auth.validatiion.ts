import { z } from 'zod';

export const credentialRequestSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    secretKey: z.string(),
});

export type CredentialRequestInput = z.infer<typeof credentialRequestSchema>;

export const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z.object({
    newPassword: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .regex(
            /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
            'Password must contain at least one uppercase letter, one number, and one special character'
        ),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
