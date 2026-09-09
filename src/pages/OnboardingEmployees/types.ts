import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';

import type SCREENS from '@src/SCREENS';

type OnboardingEmployeesProps = PlatformStackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.EMPLOYEES>;

type BaseOnboardingEmployeesProps = OnboardingEmployeesProps & {
    shouldUseNativeStyles: boolean;
};

export type {OnboardingEmployeesProps, BaseOnboardingEmployeesProps};
