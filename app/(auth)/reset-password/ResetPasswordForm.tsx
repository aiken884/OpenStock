'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import FooterLink from '@/components/forms/FooterLink';
import InputField from '@/components/forms/InputField';
import PasswordRequirements from '@/components/forms/PasswordRequirements';
import OpenDevSocietyBranding from '@/components/OpenDevSocietyBranding';
import { Button } from '@/components/ui/button';
import { resetPasswordWithToken } from '@/lib/actions/auth.actions';
import { PASSWORD_VALIDATION } from '@/lib/constants';

type ResetPasswordFormData = {
    newPassword: string;
    confirmPassword: string;
};

const ResetPasswordForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') ?? '';
    const error = searchParams.get('error');

    const {
        register,
        watch,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormData>({
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
        },
        mode: 'onBlur',
    });

    const newPassword = watch('newPassword');

    useEffect(() => {
        if (error === 'INVALID_TOKEN') {
            toast.error('重設連結無效或已過期。');
        }
    }, [error]);

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) {
            toast.error('重設連結無效或已過期。');
            return;
        }

        try {
            const result = await resetPasswordWithToken({
                token,
                newPassword: data.newPassword,
            });

            if (result.success) {
                toast.success('密碼已更新，請重新登入。');
                router.push('/sign-in');
                return;
            }

            toast.error('重設密碼失敗', {
                description: result.error ?? '無法重設密碼。',
            });
        } catch (error) {
            toast.error('重設密碼失敗', {
                description: error instanceof Error ? error.message : '無法重設密碼。',
            });
        }
    };

    return (
        <>
            <h1 className="form-title">設定新密碼</h1>
            <p className="text-sm text-gray-400 mb-6">
                請為你的帳號輸入一組新密碼。
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    name="newPassword"
                    label="新密碼"
                    placeholder="請輸入新密碼"
                    type="password"
                    register={register}
                    error={errors.newPassword}
                    validation={PASSWORD_VALIDATION}
                />
                <PasswordRequirements password={newPassword ?? ''} />

                <InputField
                    name="confirmPassword"
                    label="確認密碼"
                    placeholder="請再輸入一次新密碼"
                    type="password"
                    register={register}
                    error={errors.confirmPassword}
                    validation={{
                        required: '請再次確認新密碼',
                        validate: (value: string) =>
                            value === newPassword || '兩次輸入的密碼不一致',
                    }}
                />

                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting ? '重設中…' : '重設密碼'}
                </Button>

                <FooterLink text="需要新的連結？" linkText="再寄一次" href="/forgot-password" />
                <OpenDevSocietyBranding outerClassName="mt-10 flex justify-center" />
            </form>
        </>
    );
};

export default ResetPasswordForm;
