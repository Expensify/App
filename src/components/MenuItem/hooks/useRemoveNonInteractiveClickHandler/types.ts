import type {RefObject} from 'react';
import type {View} from 'react-native';

/**
 * Clears the `onclick` property React sets on a non-interactive pressable, so screen readers
 * don't announce it as clickable. No-op on native.
 */
type UseRemoveNonInteractiveClickHandler = (ref: RefObject<View | null>, isInteractive: boolean) => void;

export default UseRemoveNonInteractiveClickHandler;
