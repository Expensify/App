import type {LinkToOptions} from '@libs/Navigation/helpers/linkTo/types';
import type {OnboardingRHPVariant} from '@src/types/onyx';

type ShouldOpenRHPVariant = (variantOverride?: OnboardingRHPVariant | null) => boolean;
type HandleRHPVariantNavigation = (onboardingPolicyID?: string, variantOverride?: OnboardingRHPVariant | null, navigationOptions?: LinkToOptions) => void;

export type {ShouldOpenRHPVariant, HandleRHPVariantNavigation};
