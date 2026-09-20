'use server';

import { auth } from "@/lib/better-auth/auth";
import { inngest } from "@/lib/inngest/client";
import { headers } from "next/headers";

export const signUpWithEmail = async ({ email, password, fullName, country, investmentGoals, riskTolerance, preferredIndustry }: SignUpFormData) => {
    try {
        const response = await auth.api.signUpEmail({ body: { email, password, name: fullName } })

        if (response) {
            try {
                console.log('📤 Sending Inngest event: app/user.created for', email);
                await inngest.send({
                    name: 'app/user.created',
                    data: { email, name: fullName, country, investmentGoals, riskTolerance, preferredIndustry }
                });
                console.log('✅ Inngest event sent successfully');
            } catch (error) {
                console.error('❌ Failed to send Inngest event:', error);
                // Don't fail signup if email fails
            }
        }

        return { success: true, data: response }
    } catch (e) {
        console.log('Sign up failed', e)
        return { success: false, error: '註冊失敗' }
    }
}

export const signInWithEmail = async ({ email, password }: SignInFormData) => {
    try {
        const response = await auth.api.signInEmail({ body: { email, password } })

        // Update lastActiveAt
        if (response) {
            try {
                // Dynamic import or ensure path is correct
                const { connectToDatabase } = await import("@/database/mongoose");
                const mongoose = await connectToDatabase();
                const db = mongoose.connection.db;
                if (db) {
                    await db.collection('user').updateOne(
                        { email },
                        { $set: { lastActiveAt: new Date() } }
                    );
                }
            } catch (err) {
                console.error("Failed to update lastActiveAt", err);
            }
        }

        return { success: true, data: response }
    } catch (e) {
        console.log('Sign in failed', e)
        return { success: false, error: '登入失敗' }
    }
}

export const requestPasswordResetEmail = async ({ email }: { email: string }) => {
    if (!process.env.NODEMAILER_EMAIL || !process.env.NODEMAILER_PASSWORD) {
        return { success: false, error: '尚未設定密碼重設郵件。' }
    }

    try {
        const configuredBaseUrl = process.env.BETTER_AUTH_URL;
        const baseUrl = configuredBaseUrl || (
            process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : null
        );

        if (!baseUrl) {
            return {
                success: false,
                error: '必須先設定 BETTER_AUTH_URL 才能寄送密碼重設信。',
            }
        }

        await auth.api.requestPasswordReset({
            body: {
                email,
                redirectTo: `${baseUrl}/reset-password`,
            },
        });

        return { success: true }
    } catch (e) {
        console.log('Password reset request failed', e)
        return { success: false, error: '無法寄送密碼重設信。' }
    }
}

export const resetPasswordWithToken = async (
    { token, newPassword }: { token: string; newPassword: string }
) => {
    try {
        await auth.api.resetPassword({
            body: {
                token,
                newPassword,
            },
        });

        return { success: true }
    } catch (e) {
        console.log('Password reset failed', e)
        return { success: false, error: '重設連結無效或已過期。' }
    }
}

export const signOut = async () => {
    try {
        await auth.api.signOut({ headers: await headers() });
    } catch (e) {
        console.log('Sign out failed', e)
        return { success: false, error: '登出失敗' }
    }
}

