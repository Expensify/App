import type {RouteProp} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type OnboardingWorkspaceInviteProps = StackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.WORKSPACE_INVITE>;

type BaseOnboardingWorkspaceInviteProps = {
    /* Whether to use native styles tailored for native devices */
    shouldUseNativeStyles: boolean;

    route: RouteProp<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.WORKSPACE_INVITE>;
};

export type {OnboardingWorkspaceInviteProps, BaseOnboardingWorkspaceInviteProps};
