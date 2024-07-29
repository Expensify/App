import type {StackScreenProps} from '@react-navigation/stack';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type OnboardingPurposeProps = Record<string, unknown> & StackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.PURPOSE>;

type BaseOnboardingPurposeProps = OnboardingPurposeProps & {
    /* Whether to use native styles tailored for native devices */
    shouldUseNativeStyles: boolean;

    /** Whether to use the maxHeight (true) or use the 100% of the height (false) */
    shouldEnableMaxHeight: boolean;
};

export type {BaseOnboardingPurposeProps, OnboardingPurposeProps};
