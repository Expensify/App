import React from 'react';

type TOnboardingRef = {
    handleOuterClick: () => void;
};

const onboardingRef = React.createRef<TOnboardingRef>();

const OnboardingRefManager = {
    ref: onboardingRef,
    handleOuterClick: () => {
        onboardingRef.current?.handleOuterClick();
    },
};

export type {TOnboardingRef};
export default OnboardingRefManager;
