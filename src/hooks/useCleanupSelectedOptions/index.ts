import {NavigationContainerRefContext, useIsFocused} from '@react-navigation/native';
import {useContext, useEffect} from 'react';
import NAVIGATORS from '@src/NAVIGATORS';

let shouldCleanupSelectedOptions = false;

const useCleanupSelectedOptions = (cleanupFunction?: () => void) => {
    const navigationContainerRef = useContext(NavigationContainerRefContext);
    const state = navigationContainerRef?.getState();
    const lastRoute = state?.routes.at(-1);
    const isRightModalOpening = lastRoute?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;

    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused || isRightModalOpening) {
            return;
        }
        shouldCleanupSelectedOptions = false;
        cleanupFunction?.();
    }, [isFocused, cleanupFunction, isRightModalOpening]);
};

export {useCleanupSelectedOptions};
