import type {RouteProp} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type OnboardingWorkspacesProps = StackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.WORKSPACES>;

type BaseOnboardingWorkspacesProps = {
    /* Whether to use native styles tailored for native devices */
    shouldUseNativeStyles: boolean;

    route: RouteProp<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.WORKSPACES>;
};

export type {OnboardingWorkspacesProps, BaseOnboardingWorkspacesProps};
