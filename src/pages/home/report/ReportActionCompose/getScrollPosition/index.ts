import type {GetScrollPositionType, TextInputScrollProps} from './types';

function getScrollPosition({textInputRef}: TextInputScrollProps): GetScrollPositionType {
    let scrollValue = 0;
    if (textInputRef?.current) {
        if ('scrollTop' in textInputRef.current) {
            scrollValue = textInputRef.current.scrollTop;
        }
    }
    return {scrollValue};
}

export default getScrollPosition;
