import type {HandleRHPVariantNavigation, ShouldOpenRHPVariant} from './types';

/**
 * Side Panel is not supported on native platforms, so we always return false.
 */
const shouldOpenRHPVariant: ShouldOpenRHPVariant = () => false;

/**
 * No-op on native platforms since Side Panel is not supported.
 */
const handleRHPVariantNavigation: HandleRHPVariantNavigation = () => {};

export {shouldOpenRHPVariant, handleRHPVariantNavigation};
