import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type OnboardingWorkspaceConfirmationProps = Record<string, unknown> & PlatformStackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.WORKSPACE_CONFIRMATION>;

type BaseOnboardingWorkspaceConfirmationProps = PlatformStackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.WORKSPACE_CONFIRMATION> & {
    /* Whether to use native styles tailored for native devices */
    shouldUseNativeStyles: boolean;
};

export type {OnboardingWorkspaceConfirmationProps, BaseOnboardingWorkspaceConfirmationProps};
