import HasHoverSupport from './types';

/**
 * Allows us to identify whether the platform is hoverable.
 */
const hasHoverSupport: HasHoverSupport = () => window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;

export default hasHoverSupport;
