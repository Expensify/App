import React from 'react';
import AnimatedStepProvider from '../../../../components/AnimatedStep/AnimatedStepProvider';
import TwoFactorAuthSteps from './TwoFactorAuthSteps';

function TwoFactorAuthPage() {
    return (
        <AnimatedStepProvider>
            <TwoFactorAuthSteps />
        </AnimatedStepProvider>
    );
}

export default TwoFactorAuthPage;
