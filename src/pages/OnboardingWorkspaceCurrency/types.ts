import type {StackScreenProps} from '@react-navigation/stack';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type OnboardingWorkspaceCurrencyProps = StackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.DYNAMIC_WORKSPACE_CURRENCY>;

type BaseOnboardingWorkspaceCurrencyProps = {
    /* Whether to use native styles tailored for native devices */
    shouldUseNativeStyles: boolean;
};

export type {OnboardingWorkspaceCurrencyProps, BaseOnboardingWorkspaceCurrencyProps};
