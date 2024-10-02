import React from 'react';
import BaseOnboardingWork from './BaseOnboardingWork';
import type {OnboardingWorkProps} from './types';

function OnboardingWork(props: OnboardingWorkProps) {
    return (
        <BaseOnboardingWork
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

OnboardingWork.displayName = 'OnboardingWork';

export default OnboardingWork;
