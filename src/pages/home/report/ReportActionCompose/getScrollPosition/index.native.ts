import {getScrollPositionType, TextInputScrollProps} from './types';

function getScrollPosition({mobileInputScrollPosition}: TextInputScrollProps): getScrollPositionType {
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
