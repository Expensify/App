import type {UseKeyboardDrivenScroll} from './types';

// Web has no keyboard frames, so callers scroll on their own
const useKeyboardDrivenScroll: UseKeyboardDrivenScroll = () => ({
    scrollWithKeyboard: () => false,
    cancelScrollWithKeyboard: () => {},
});

export default useKeyboardDrivenScroll;
