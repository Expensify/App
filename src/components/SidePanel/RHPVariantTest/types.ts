import type {Route} from '@src/ROUTES';
import type {OnboardingRHPVariant} from '@src/types/onyx';

type NavigateToRHPVariantRoute = (route: Route) => void;

type ShouldOpenRHPVariant = (variantOverride?: OnboardingRHPVariant | null) => boolean;
type HandleRHPVariantNavigation = (onboardingPolicyID: string | undefined, variantOverride: OnboardingRHPVariant | null | undefined, navigate: NavigateToRHPVariantRoute) => void;

export type {ShouldOpenRHPVariant, HandleRHPVariantNavigation};
