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
        // Use window height changes to toggle the keyboard. To maintain keyboard state
        // on all platforms we also use focus/blur events. So we need to make sure here
        // that we avoid redundant keyboard toggling.
        // Minus 100px is needed to make sure that when the internet connection is
        // disabled in android chrome and a small 'No internet connection' text box appears,
        // we do not take it as a sign to open the keyboard
        if (!isWindowHeightReducedByKeyboard && windowHeight < prevWindowHeight - 100) {
            toggleKeyboardOnSmallScreens(true);
        } else if (isWindowHeightReducedByKeyboard && windowHeight > prevWindowHeight) {
            toggleKeyboardOnSmallScreens(false);
        }
    }, [isWindowHeightReducedByKeyboard, prevWindowHeight, toggleKeyboardOnSmallScreens, windowHeight]);

    return isWindowHeightReducedByKeyboard;
};

export default useIsWindowHeightReducedByKeyboard;
