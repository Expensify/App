import type {HandleRHPVariantNavigation, ShouldOpenRHPVariant} from './types';

/**
 * Side Panel is not supported on native platforms, so we always return false.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const shouldOpenRHPVariant: ShouldOpenRHPVariant = (_variantOverride) => false;

/**
 * No-op on native platforms since Side Panel is not supported.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleRHPVariantNavigation: HandleRHPVariantNavigation = (_onboardingPolicyID, _variantOverride) => {};

export {shouldOpenRHPVariant, handleRHPVariantNavigation};
