type MarkCopyableTextMouseDownOptions = {
    shouldSuppressNextPress?: boolean;
};

type HandleCopyableTextRowPressOptions = {
    shouldCheck?: boolean;
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
        isPressStartOnCopyableText,
        markMouseDownOnCopyableText,
        markTouchStartOnCopyableText,
        shouldSuppressCopyableTextRowFocus,
        shouldSuppressCopyableTextRowLongPress,
        shouldSuppressCopyableTextRowPress,
    };
}

export {isPressStartOnCopyableText};
export default useCopyableTextRowPress;
