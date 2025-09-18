import React from 'react';
import BaseOnboardingWorkEmailValidation from './BaseOnboardingWorkEmailValidation';
import type {OnboardingWorkEmailValidationProps} from './types';

function OnboardingWorkEmailValidation(props: OnboardingWorkEmailValidationProps) {
    return (
        <BaseOnboardingWorkEmailValidation
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

OnboardingWorkEmailValidation.displayName = 'OnboardingWorkEmailValidation';

export default OnboardingWorkEmailValidation;
