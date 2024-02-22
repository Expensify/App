import type {GetScrollPositionType, TextInputScrollProps} from './types';

function getScrollPosition({textInputRef}: TextInputScrollProps): GetScrollPositionType {
    if (!textInputRef.current?.scrollTop) {
        return {
            scrollValue: 0,
        };
    }
    return {
        scrollValue: textInputRef.current?.scrollTop,
    };
}

export default getScrollPosition;
