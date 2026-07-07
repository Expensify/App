import type {GetScrollPositionType, TextInputScrollProps} from './types';

function getScrollPosition({mobileInputScrollPosition}: TextInputScrollProps): GetScrollPositionType {
    if (!mobileInputScrollPosition.current) {
        return {
            scrollValue: 0,
        };
    }
    return {
        scrollValue: mobileInputScrollPosition.current,
    };
}

export default getScrollPosition;
