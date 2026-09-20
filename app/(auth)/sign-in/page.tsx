'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import InputField from '@/components/forms/InputField';
import FooterLink from '@/components/forms/FooterLink';
import { signInWithEmail } from "@/lib/actions/auth.actions";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import OpenDevSocietyBranding from "@/components/OpenDevSocietyBranding";
import React from "react";

const SignIn = () => {
    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'onBlur',
    });

    const onSubmit = async (data: SignInFormData) => {
        try {
            const result = await signInWithEmail(data);
            if (result.success) {
                router.push('/');
                return;
            }
            toast.error('登入失敗', {
                description: result.error ?? '電子郵件或密碼不正確。',
            });
        } catch (e) {
            console.error(e);
            toast.error('登入失敗', {
                description: e instanceof Error ? e.message : '無法登入。'
            })
        }
    }

    return (
        <>
            <h1 className="form-title">歡迎回來</h1>

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
                            message: '請輸入有效的電子郵件地址'
                        }
                    }}
                />

                <InputField
                    name="password"
                    label="密碼"
                    placeholder="請輸入密碼"
                    type="password"
                    register={register}
                    error={errors.password}
                    validation={{ required: '請輸入密碼', minLength: 8 }}
                />

                <div className="flex justify-end">
                    <Link href="/forgot-password" className="footer-link text-sm">
                        忘記密碼？
                    </Link>
                </div>

                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting ? '登入中…' : '登入'}
                </Button>

                <FooterLink text="還沒有帳號？" linkText="建立帳號" href="/sign-up" />
                <OpenDevSocietyBranding outerClassName="mt-10 flex justify-center" />
                <div className="mt-5 flex justify-center">
                    <a href="https://peerlist.io/ravixalgorithm/project/openstock" target="_blank" rel="noreferrer">
                        <img
                            src="https://peerlist.io/api/v1/projects/embed/PRJH8OED7MBL9MGB9HRMKAKLM66KNN?showUpvote=true&theme=light"
                            alt="OpenStock"
                            style={{ width: 'auto', height: '72px' }}
                        />
                    </a>
                </div>
            </form>
        </>
    );
};
export default SignIn;
