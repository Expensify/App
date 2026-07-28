import React from 'react';

import type {OnboardingWorkEmailValidationProps} from './types';

import BaseOnboardingWorkEmailValidation from './BaseOnboardingWorkEmailValidation';

function OnboardingWorkEmailValidation(props: OnboardingWorkEmailValidationProps) {
    return (
        <BaseOnboardingWorkEmailValidation
            shouldUseNativeStyles
            {...props}
        />
    );
}

export default OnboardingWorkEmailValidation;
