import { Suspense } from 'react';

import ResetPasswordForm from './ResetPasswordForm';

const ResetPasswordPage = () => {
    return (
        <Suspense fallback={<div className="text-sm text-gray-400">正在載入重設表單…</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
};

export default ResetPasswordPage;
