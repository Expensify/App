import type {StackScreenProps} from '@react-navigation/stack';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type OnboardingWorkspaceInviteProps = StackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.DYNAMIC_WORKSPACE_INVITE>;

type BaseOnboardingWorkspaceInviteProps = {
    /* Whether to use native styles tailored for native devices */
    shouldUseNativeStyles: boolean;
};

export type {OnboardingWorkspaceInviteProps, BaseOnboardingWorkspaceInviteProps};
