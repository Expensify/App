import CONST from '@src/CONST';

type OnboardingFeatureConfig = {
    id: string;
    enabledByDefault?: boolean;
    requiresUpdate?: boolean;
};

type OnboardingFeatureMapItem = OnboardingFeatureConfig & {
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
export type {OnboardingFeatureMapItem};
