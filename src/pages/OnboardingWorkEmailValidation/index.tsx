import React from 'react';
import OnboardingWrapper from '@components/OnboardingWrapper';
import BaseOnboardingWorkEmailValidation from './BaseOnboardingWorkEmailValidation';
import type {OnboardingWorkEmailValidationProps} from './types';

function OnboardingWorkEmailValidation(props: OnboardingWorkEmailValidationProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingWorkEmailValidation
                shouldUseNativeStyles={false}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </OnboardingWrapper>
    );
}

export default OnboardingWorkEmailValidation;
