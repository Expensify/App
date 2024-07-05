type OnboardingPurposeProps = Record<string, unknown>;

type BaseOnboardingPurposeProps = OnboardingPurposeProps & {
    /* Whether to use native styles tailored for native devices */
    shouldUseNativeStyles: boolean;

    /** Whether to use the maxHeight (true) or use the 100% of the height (false) */
    shouldEnableMaxHeight: boolean;
};

export type {BaseOnboardingPurposeProps, OnboardingPurposeProps};
