import type {RefObject} from 'react';

/** Returns a reset callback for the input's focus and blur handlers. */
type UseScrollOnKeyboardReopen = (ref: RefObject<{isFocused: () => boolean} | null>, scrollToInput: () => void, isActive: boolean) => () => void;

export default UseScrollOnKeyboardReopen;
