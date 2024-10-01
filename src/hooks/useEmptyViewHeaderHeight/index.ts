import {BUTTON_HEIGHT, BUTTON_MARGIN, HEADER_HEIGHT} from './const';

function useEmptyViewHeaderHeight(isSmallScreenWidth: boolean): number {
    return isSmallScreenWidth ? HEADER_HEIGHT + BUTTON_HEIGHT + BUTTON_MARGIN : HEADER_HEIGHT;
}

export default useEmptyViewHeaderHeight;
