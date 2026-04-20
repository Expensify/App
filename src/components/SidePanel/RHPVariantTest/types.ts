import type {OnboardingRHPVariant} from '@src/types/onyx';

type ShouldOpenRHPVariant = (variantOverride?: OnboardingRHPVariant | null) => boolean;
type HandleRHPVariantNavigation = (onboardingPolicyID?: string, variantOverride?: OnboardingRHPVariant | null) => void;

export type {ShouldOpenRHPVariant, HandleRHPVariantNavigation};
