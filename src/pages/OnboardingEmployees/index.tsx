import React from 'react';
import OnboardingWrapper from '@components/OnboardingWrapper';
import BaseOnboardingEmployees from './BaseOnboardingEmployees';
import type {OnboardingEmployeesProps} from './types';

function OnboardingEmployees(props: OnboardingEmployeesProps) {
    return (
        <OnboardingWrapper>
            <BaseOnboardingEmployees
                shouldUseNativeStyles={false}
                {...props}
            />
        </OnboardingWrapper>
    );
}

export default OnboardingEmployees;
