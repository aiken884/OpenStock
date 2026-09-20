'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import InputField from '@/components/forms/InputField';
import FooterLink from '@/components/forms/FooterLink';
import OpenDevSocietyBranding from '@/components/OpenDevSocietyBranding';
import { requestPasswordResetEmail } from '@/lib/actions/auth.actions';

type ForgotPasswordFormData = {
    email: string;
};

const ForgotPasswordPage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordFormData>({
        defaultValues: {
            email: '',
        },
        mode: 'onBlur',
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            const result = await requestPasswordResetEmail(data);

            if (result.success) {
                toast.success('若該電子郵件已註冊，重設連結已寄出。');
                return;
            }

            toast.error('目前無法重設密碼', {
                description: result.error ?? '無法開始重設密碼。',
            });
        } catch (error) {
            toast.error('目前無法重設密碼', {
                description: error instanceof Error ? error.message : '無法開始重設密碼。',
            });
        }
    };

    return (
        <>
            <h1 className="form-title">忘記密碼？</h1>
            <p className="text-sm text-gray-400 mb-6">
                輸入電子郵件，我們會寄送密碼重設連結。
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    name="email"
                    label="電子郵件"
                    placeholder="you@example.com"
                    register={register}
                    error={errors.email}
                    validation={{
                        required: '請輸入電子郵件',
                        pattern: {
                            value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/,
                            message: '請輸入有效的電子郵件地址',
                        },
                    }}
                />

                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting ? '寄送中…' : '寄送重設連結'}
                </Button>

                <FooterLink text="想起來了？" linkText="登入" href="/sign-in" />
                <OpenDevSocietyBranding outerClassName="mt-10 flex justify-center" />
            </form>
        </>
    );
};

export default ForgotPasswordPage;
