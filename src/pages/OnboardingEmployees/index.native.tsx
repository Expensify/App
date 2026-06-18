import React from 'react';

import type {OnboardingEmployeesProps} from './types';

import BaseOnboardingEmployees from './BaseOnboardingEmployees';

function OnboardingEmployees(props: OnboardingEmployeesProps) {
    return (
        <BaseOnboardingEmployees
            shouldUseNativeStyles
            {...props}
        />
    );
}

export default OnboardingEmployees;
