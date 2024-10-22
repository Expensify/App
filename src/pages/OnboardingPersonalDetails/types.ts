import type {RouteProp} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type OnboardingPersonalDetailsProps = Record<string, unknown> & StackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.PERSONAL_DETAILS>;

type BaseOnboardingPersonalDetailsProps = WithCurrentUserPersonalDetailsProps & {
    /* Whether to use native styles tailored for native devices */
    shouldUseNativeStyles: boolean;

    route: RouteProp<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.PERSONAL_DETAILS>;
};

export type {OnboardingPersonalDetailsProps, BaseOnboardingPersonalDetailsProps};
