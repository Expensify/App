import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type OnboardingDomainRestrictedWorkspace = undefined;

export type {OnboardingDomainRestrictedWorkspace};

type OnboardingDomainRestrictedWorkspaceProps = PlatformStackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.DOMAIN_RESTRICTED_WORKSPACE>;

type BaseOnboardingDomainRestrictedWorkspaceProps = OnboardingDomainRestrictedWorkspaceProps & {
    /* Whether to use native styles tailored for native devices */
    shouldUseNativeStyles: boolean;
};

export type {OnboardingDomainRestrictedWorkspaceProps, BaseOnboardingDomainRestrictedWorkspaceProps};
