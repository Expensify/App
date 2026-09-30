import type {RefObject} from 'react';

type UseBlurOnKeyboardHide = (ref: RefObject<{blur: () => void} | null>) => void;

export default UseBlurOnKeyboardHide;
