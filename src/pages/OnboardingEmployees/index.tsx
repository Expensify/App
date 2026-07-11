import OnboardingWrapper from '@components/OnboardingWrapper';

import React from 'react';

import type {OnboardingEmployeesProps} from './types';

import BaseOnboardingEmployees from './BaseOnboardingEmployees';

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
