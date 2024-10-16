import type {StackScreenProps} from '@react-navigation/stack';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type OnboardingEmployeesProps = StackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.EMPLOYEES>;

type BaseOnboardingEmployeesProps = OnboardingEmployeesProps & {
    /* Whether to use native styles tailored for native devices */
    shouldUseNativeStyles: boolean;
};

export type {OnboardingEmployeesProps, BaseOnboardingEmployeesProps};
