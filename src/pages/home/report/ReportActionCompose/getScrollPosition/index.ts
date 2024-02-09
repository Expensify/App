import {getScrollPositionType, TextInputScrollProps} from './types';

function getScrollPosition({textInputRef}: TextInputScrollProps): getScrollPositionType {
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
