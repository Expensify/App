import CONST from '@src/CONST';

import type GetCurrentSelection from './types';

const COPYABLE_TEXT_DATA_SET = {[CONST.COPYABLE_TEXT_ELEMENT]: true} as const;
const COPYABLE_ROW_DATA_SET = {[CONST.COPYABLE_ROW_ELEMENT]: true} as const;

type MarkCopyableTextMouseDownOptions = {
    shouldSuppressNextPress?: boolean;
};

type HandleCopyableTextRowPressOptions = {
    shouldCheck?: boolean;
    shouldDelayMousePress?: boolean;
};

const isPressStartOnCopyableText = () => false;

function useCopyableTextRowPress() {
    // Native does not expose browser selection APIs, so copyable text never suppresses row interactions here.
    const markMouseDownOnCopyableText: (target: EventTarget | null | undefined, shouldCheck?: boolean, options?: MarkCopyableTextMouseDownOptions) => boolean = () => false;
    const markTouchStartOnCopyableText: (event: unknown, shouldCheck?: boolean) => boolean = () => false;
    const shouldSuppressCopyableTextRowPress: (shouldCheck?: boolean) => boolean = () => false;
    const shouldSuppressCopyableTextRowLongPress: (shouldCheck?: boolean) => boolean = () => false;
    const shouldSuppressCopyableTextRowFocus = () => false;
    const handleCopyableTextRowPress: (onPress: () => void, options?: HandleCopyableTextRowPressOptions) => void = (onPress) => onPress();

    return {
        handleCopyableTextRowPress,
        markMouseDownOnCopyableText,
        markTouchStartOnCopyableText,
        shouldSuppressCopyableTextRowFocus,
        shouldSuppressCopyableTextRowLongPress,
        shouldSuppressCopyableTextRowPress,
    };
}

// This is a no-op function for native devices because they wouldn't be able to support Selection API like a website.
const getCurrentSelection: GetCurrentSelection = () => '';

export {COPYABLE_ROW_DATA_SET, COPYABLE_TEXT_DATA_SET, isPressStartOnCopyableText, useCopyableTextRowPress};

export default {
    getCurrentSelection,
};
