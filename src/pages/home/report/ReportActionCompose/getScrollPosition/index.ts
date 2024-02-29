import type {GetScrollPositionType, TextInputScrollProps} from './types';

function getScrollPosition({textInputRef}: TextInputScrollProps): GetScrollPositionType {
    let scrollValue = 0;
    if (textInputRef.current instanceof HTMLDivElement) {
        scrollValue = textInputRef.current.scrollTop;
    }

    return {scrollValue};
}

export default getScrollPosition;
