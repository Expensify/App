import type {RouteProp} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type OnboardingWorkEmailValidationProps = Record<string, unknown> & StackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION>;

type BaseOnboardingWorkEmailValidationProps = {
    /* Whether to use native styles tailored for native devices */
    shouldUseNativeStyles: boolean;

    route: RouteProp<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION>;
};

export type {OnboardingWorkEmailValidationProps, BaseOnboardingWorkEmailValidationProps};
