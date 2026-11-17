import type {HostInstance} from 'react-native';

import type CaptureInputScrolledToEnd from './types';

// A browser keeps an input's scrollTop when its height changes, and can reset it to 0 when the box grows. Autofocus scrolls a long value to the caret
// at its end, so a later cap change would leave that end, and the caret, below the box. The container captures that state before it changes the cap.
const captureInputScrolledToEnd: CaptureInputScrolledToEnd = (content: HostInstance | null) => {
    const input = document.activeElement;
    if (!(content instanceof HTMLElement) || !(input instanceof HTMLElement) || !content.contains(input)) {
        return undefined;
    }

    const maxScrollTop = input.scrollHeight - input.clientHeight;
    if (maxScrollTop < 1 || input.scrollTop < maxScrollTop - 1) {
        return undefined;
    }

    return () => {
        if (!input.isConnected) {
            return;
        }
        input.scrollTop = input.scrollHeight;
    };
};

export default captureInputScrolledToEnd;
