import {BUTTON_HEIGHT, BUTTON_MARGIN, HEADER_HEIGHT} from './const';

function useEmptyViewHeaderHeight(isSmallScreenWidth: boolean, areHeaderButtonsDisplayed: boolean): number {
    const BUTTONS_HEIGHT = areHeaderButtonsDisplayed ? BUTTON_HEIGHT + BUTTON_MARGIN : 0;

    return isSmallScreenWidth ? HEADER_HEIGHT + BUTTONS_HEIGHT : HEADER_HEIGHT;
}

export default useEmptyViewHeaderHeight;
