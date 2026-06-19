import React from 'react';
import BaseOnboardingWorkEmailValidation from './BaseOnboardingWorkEmailValidation';
import type {OnboardingWorkEmailValidationProps} from './types';

function OnboardingWorkEmailValidation(props: OnboardingWorkEmailValidationProps) {
    return (
        <BaseOnboardingWorkEmailValidation
            shouldUseNativeStyles
            {...props}
        />
    );
}

export default OnboardingWorkEmailValidation;
