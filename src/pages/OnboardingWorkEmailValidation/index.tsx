import OnboardingWrapper from '@components/OnboardingWrapper';

import React from 'react';

import type {OnboardingWorkEmailValidationProps} from './types';

import BaseOnboardingWorkEmailValidation from './BaseOnboardingWorkEmailValidation';

function OnboardingWorkEmailValidation(props: OnboardingWorkEmailValidationProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingWorkEmailValidation
                shouldUseNativeStyles={false}
                {...props}
            />
        </OnboardingWrapper>
    );
}

export default OnboardingWorkEmailValidation;
