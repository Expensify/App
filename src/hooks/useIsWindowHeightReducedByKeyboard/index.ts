import {useCallback, useEffect, useState} from 'react';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useWindowDimensions from '@hooks/useWindowDimensions';

const useIsWindowHeightReducedByKeyboard = () => {
    const [isWindowHeightReducedByKeyboard, setIsWindowHeightReducedByKeyboard] = useState(false);
    const {windowHeight} = useWindowDimensions();
    const prevWindowHeight = usePrevious(windowHeight);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const toggleKeyboardOnSmallScreens = useCallback(
        (isKBOpen: boolean) => {
            if (!shouldUseNarrowLayout) {
                return;
            }
            setIsWindowHeightReducedByKeyboard(isKBOpen);
        },
        [shouldUseNarrowLayout],
    );
    useEffect(() => {
        if (!isWindowHeightReducedByKeyboard && windowHeight < prevWindowHeight - 100) {
            toggleKeyboardOnSmallScreens(true);
        } else if (isWindowHeightReducedByKeyboard && windowHeight > prevWindowHeight) {
            toggleKeyboardOnSmallScreens(false);
        }
    }, [isWindowHeightReducedByKeyboard, prevWindowHeight, toggleKeyboardOnSmallScreens, windowHeight]);

    return isWindowHeightReducedByKeyboard;
};

export default useIsWindowHeightReducedByKeyboard;
