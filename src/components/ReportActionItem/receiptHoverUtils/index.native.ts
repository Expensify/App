import type {IsElementHovered, ResetButtonHoverState} from './types';

// No-op on native — hover states don't exist on mobile
const resetButtonHoverState: ResetButtonHoverState = () => {};

const isElementHovered: IsElementHovered = () => false;

export {resetButtonHoverState, isElementHovered};
