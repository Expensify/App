import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';

import type SCREENS from '@src/SCREENS';

type OnboardingAccountingProps = PlatformStackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.ACCOUNTING>;

type BaseOnboardingAccountingProps = OnboardingAccountingProps & {
    shouldUseNativeStyles: boolean;
};

export type {OnboardingAccountingProps, BaseOnboardingAccountingProps};
