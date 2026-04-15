import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import type {Route} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type OnboardingWorkspaceConfirmationProps = Record<string, unknown> & PlatformStackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.DYNAMIC_WORKSPACE_CONFIRMATION>;

type BaseOnboardingWorkspaceConfirmationProps = {
    /* Whether to use native styles tailored for native devices */
    shouldUseNativeStyles: boolean;
    navigateBackTo?: Route;
};

export type {OnboardingWorkspaceConfirmationProps, BaseOnboardingWorkspaceConfirmationProps};
