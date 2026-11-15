import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

/** The workspace features offered on the onboarding "interested features" step */
type OnboardingFeatureID = ValueOf<
    Pick<
        typeof CONST.POLICY.MORE_FEATURES,
        | 'ARE_CATEGORIES_ENABLED'
        | 'ARE_CONNECTIONS_ENABLED'
        | 'ARE_COMPANY_CARDS_ENABLED'
        | 'ARE_WORKFLOWS_ENABLED'
        | 'IS_TRAVEL_ENABLED'
        | 'ARE_RULES_ENABLED'
        | 'ARE_DISTANCE_RATES_ENABLED'
        | 'ARE_EXPENSIFY_CARDS_ENABLED'
        | 'ARE_TAGS_ENABLED'
        | 'ARE_PER_DIEM_RATES_ENABLED'
        | 'IS_TIME_TRACKING_ENABLED'
    >
>;

type OnboardingFeatureConfig = {
    id: OnboardingFeatureID;
    enabledByDefault?: boolean;
    requiresUpdate?: boolean;
};

/** Saved in Onyx, so `id` stays a string: stored maps can hold features this build no longer offers */
type OnboardingFeatureMapItem = Omit<OnboardingFeatureConfig, 'id'> & {
    id: string;
    enabled: boolean;
};

const ONBOARDING_FEATURES: OnboardingFeatureConfig[] = [
    {id: CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED, enabledByDefault: true},
    {id: CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED, enabledByDefault: true},
    {id: CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED, enabledByDefault: true},
    {id: CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED, enabledByDefault: true},
    {id: CONST.POLICY.MORE_FEATURES.IS_TRAVEL_ENABLED},
    {id: CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED, requiresUpdate: true},
    {id: CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED},
    {id: CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED},
    {id: CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED},
    {id: CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED, requiresUpdate: true},
    {id: CONST.POLICY.MORE_FEATURES.IS_TIME_TRACKING_ENABLED},
];

function getDefaultOnboardingFeaturesMap(): OnboardingFeatureMapItem[] {
    return ONBOARDING_FEATURES.map((feature) => ({
        ...feature,
        enabled: !!feature.enabledByDefault,
    }));
}

export {getDefaultOnboardingFeaturesMap, ONBOARDING_FEATURES};
export type {OnboardingFeatureID, OnboardingFeatureMapItem};
