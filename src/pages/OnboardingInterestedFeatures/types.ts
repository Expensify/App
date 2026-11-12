import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';

import type SCREENS from '@src/SCREENS';
import type IconAsset from '@src/types/utils/IconAsset';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

type OnboardingInterestedFeaturesProps = PlatformStackScreenProps<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.INTERESTED_FEATURES>;

type BaseOnboardingInterestedFeaturesProps = OnboardingInterestedFeaturesProps & {
    shouldUseNativeStyles: boolean;
};

type Feature = {
    id: string;
    title: string;
    subtitle?: string;
    icon: IconAsset;
    enabledByDefault?: boolean;
    requiresUpdate?: boolean;
    enabled?: boolean;

    /** Sentry label for the feature tile */
    sentryLabel: SentryLabel;

    /** Sentry label for the checkbox inside the feature tile */
    checkboxSentryLabel: SentryLabel;
};

type FeatureDetails = Pick<Feature, 'title' | 'subtitle' | 'icon' | 'sentryLabel' | 'checkboxSentryLabel'>;

type SectionObject = {
    titleTranslationKey: string;
    items: Feature[];
};

export type {OnboardingInterestedFeaturesProps, BaseOnboardingInterestedFeaturesProps, Feature, FeatureDetails, SectionObject};
