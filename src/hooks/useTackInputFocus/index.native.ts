import type UseTackInputFocus from './types';

/**
 * Detects input or text area focus on browser. Native doesn't support DOM so default to false
 */
const useTackInputFocus: UseTackInputFocus = () => false;

export default useTackInputFocus;
