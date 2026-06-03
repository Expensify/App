import type {OnboardingRHPVariant} from '@src/types/onyx';

type RHPVariantNavigationOptions = {
    afterTransition?: () => void;
};

type ShouldOpenRHPVariant = (variantOverride?: OnboardingRHPVariant | null) => boolean;
type HandleRHPVariantNavigation = (onboardingPolicyID?: string, variantOverride?: OnboardingRHPVariant | null, navigationOptions?: RHPVariantNavigationOptions) => void;

export type {ShouldOpenRHPVariant, HandleRHPVariantNavigation};
