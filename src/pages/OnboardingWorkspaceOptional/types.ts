import type {RouteProp} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type OnboardingWorkspaceOptionalProps = Record<string, unknown> & StackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.WORKSPACE_OPTIONAL>;

type BaseOnboardingWorkspaceOptionalProps = {
    /* Whether to use native styles tailored for native devices */
    shouldUseNativeStyles: boolean;

    route: RouteProp<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.WORKSPACE_OPTIONAL>;
};

export type {OnboardingWorkspaceOptionalProps, BaseOnboardingWorkspaceOptionalProps};
