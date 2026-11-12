import type CanUseCssPositionSticky from './types';

/**
 * Allows us to identify whether the platform can pin an element inside its scroller with `position: sticky`.
 */
const canUseCssPositionSticky: CanUseCssPositionSticky = () => false;

export default canUseCssPositionSticky;
