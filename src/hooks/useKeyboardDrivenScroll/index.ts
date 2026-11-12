import type {UseKeyboardDrivenScroll} from './types';

// No keyboard frames on web, so callers scroll themselves
const useKeyboardDrivenScroll: UseKeyboardDrivenScroll = () => () => false;

export default useKeyboardDrivenScroll;
