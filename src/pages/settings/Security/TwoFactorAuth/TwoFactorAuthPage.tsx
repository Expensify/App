import React from 'react';
import AnimatedStepProvider from '@components/AnimatedStep/AnimatedStepProvider';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import CONST from '@src/CONST';
import TwoFactorAuthSteps from './TwoFactorAuthSteps';

function TwoFactorAuthPage() {
    return (
        <AnimatedStepProvider>
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <TwoFactorAuthSteps />
            </DelegateNoAccessWrapper>
        </AnimatedStepProvider>
    );
}

export default TwoFactorAuthPage;
