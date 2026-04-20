import type {StackScreenProps} from '@react-navigation/stack';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type OnboardingPrivateDomainProps = Record<string, unknown> & StackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.DYNAMIC_PRIVATE_DOMAIN>;

type BaseOnboardingPrivateDomainProps = {
    /* Whether to use native styles tailored for native devices */
    shouldUseNativeStyles: boolean;
};

export type {OnboardingPrivateDomainProps, BaseOnboardingPrivateDomainProps};
