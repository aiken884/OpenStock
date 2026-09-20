'use client';

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/InputField";
import SelectField from "@/components/forms/SelectField";
import PasswordRequirements from "@/components/forms/PasswordRequirements";
import { INVESTMENT_GOALS, PASSWORD_VALIDATION, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from "@/lib/constants";
import { CountrySelectField } from "@/components/forms/CountrySelectField";
import FooterLink from "@/components/forms/FooterLink";
import { signUpWithEmail } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import OpenDevSocietyBranding from "@/components/OpenDevSocietyBranding";
import React from "react";

const SignUp = () => {
    const router = useRouter()
    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormData>({
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            country: 'TW',
            investmentGoals: 'Growth',
            riskTolerance: 'Medium',
            preferredIndustry: 'Technology'
        },
        mode: 'onBlur'
    },);

    const passwordValue = watch('password');

    const onSubmit = async (data: SignUpFormData) => {
        try {
            const result = await signUpWithEmail(data);
            if (result.success) {
                router.push('/');
                return;
            }
            toast.error('註冊失敗', {
                description: result.error ?? '無法建立帳號。',
            });
        } catch (e) {
            console.error(e);
            toast.error('註冊失敗', {
                description: e instanceof Error ? e.message : '無法建立帳號。'
            })
        }
    }

    return (
        <>
            <h1 className="form-title">註冊並個人化</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    name="fullName"
                    label="姓名"
                    placeholder="請輸入姓名"
                    register={register}
                    error={errors.fullName}
                    validation={{ required: '請輸入姓名', minLength: 2 }}
                />

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
                    placeholder="請設定一組夠安全的密碼"
                    type="password"
                    register={register}
                    error={errors.password}
                    validation={PASSWORD_VALIDATION}
                />
                <PasswordRequirements password={passwordValue ?? ''} />

                <CountrySelectField
                    name="country"
                    label="國家／地區"
                    control={control}
                    error={errors.country}
                    required
                />

                <SelectField
                    name="investmentGoals"
                    label="投資目標"
                    placeholder="請選擇投資目標"
                    options={INVESTMENT_GOALS}
                    control={control}
                    error={errors.investmentGoals}
                    required
                />

                <SelectField
                    name="riskTolerance"
                    label="風險承受度"
                    placeholder="請選擇風險等級"
                    options={RISK_TOLERANCE_OPTIONS}
                    control={control}
                    error={errors.riskTolerance}
                    required
                />

                <SelectField
                    name="preferredIndustry"
                    label="偏好產業"
                    placeholder="請選擇偏好產業"
                    options={PREFERRED_INDUSTRIES}
                    control={control}
                    error={errors.preferredIndustry}
                    required
                />

                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting ? '建立帳號中…' : '開始投資之旅'}
                </Button>

                <FooterLink text="已經有帳號？" linkText="登入" href="/sign-in" />

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
    )
}
export default SignUp;
