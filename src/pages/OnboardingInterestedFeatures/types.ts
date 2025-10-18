import type {EnablePolicyFeatureCommand} from '@libs/actions/RequestConflictUtils';
import type {WRITE_COMMANDS} from '@libs/API/types';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import type IconAsset from '@src/types/utils/IconAsset';

type OnboardingInterestedFeaturesProps = PlatformStackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.INTERESTED_FEATURES>;

type BaseOnboardingInterestedFeaturesProps = OnboardingInterestedFeaturesProps & {
    /* Whether to use native styles tailored for native devices */
    shouldUseNativeStyles: boolean;
};

type Feature = {
    id: string;
    title: string;
    icon: IconAsset;
    enabledByDefault?: boolean;
    apiEndpoint: EnablePolicyFeatureCommand | typeof WRITE_COMMANDS.TOGGLE_POLICY_PER_DIEM;
    requiresUpdate?: boolean;
    enabled?: boolean;
};

type SectionObject = {
    titleTranslationKey: string;
    items: Feature[];
};

export type {OnboardingInterestedFeaturesProps, BaseOnboardingInterestedFeaturesProps, Feature, SectionObject};
