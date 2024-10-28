import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import {BUTTON_HEIGHT, BUTTON_MARGIN, HEADER_HEIGHT} from './const';

function useEmptyViewHeaderHeight(isSmallScreenWidth: boolean): number {
    const safeAreaInsets = useSafeAreaInsets();

    return isSmallScreenWidth ? HEADER_HEIGHT + BUTTON_HEIGHT + BUTTON_MARGIN + safeAreaInsets.top : HEADER_HEIGHT;
}

export default useEmptyViewHeaderHeight;
