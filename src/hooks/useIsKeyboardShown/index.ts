import {useCallback, useEffect, useState} from 'react';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useWindowDimensions from '@hooks/useWindowDimensions';

const useIsKeyboardShown = () => {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const {windowHeight} = useWindowDimensions();
    const prevWindowHeight = usePrevious(windowHeight);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const toggleKeyboardOnSmallScreens = useCallback(
        (isKBOpen: boolean) => {
            if (!shouldUseNarrowLayout) {
                return;
            }
            setIsKeyboardOpen(isKBOpen);
        },
        [shouldUseNarrowLayout],
    );
    useEffect(() => {
        if (!isKeyboardOpen && windowHeight < prevWindowHeight - 100) {
            toggleKeyboardOnSmallScreens(true);
        } else if (isKeyboardOpen && windowHeight > prevWindowHeight) {
            toggleKeyboardOnSmallScreens(false);
        }
    }, [isKeyboardOpen, prevWindowHeight, toggleKeyboardOnSmallScreens, windowHeight]);

    return isKeyboardOpen;
};

export default useIsKeyboardShown;
