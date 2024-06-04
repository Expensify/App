import React from 'react';
import BaseOnboardingWork from './BaseOnboardingWork';
import type {OnboardingWorkProps} from './types';

function OnboardingWork({...rest}: Omit<OnboardingWorkProps, 'shouldUseNativeStyles'>) {
    return (
        <BaseOnboardingWork
            shouldUseNativeStyles={false}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

OnboardingWork.displayName = 'OnboardingPurpose';

export default OnboardingWork;
