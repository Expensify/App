import {useIsFocused} from '@react-navigation/native';
import {useEffect} from 'react';
import {navigationRef} from '@libs/Navigation/Navigation';
import NAVIGATORS from '@src/NAVIGATORS';

const useCleanupSelectedOptions = (cleanupFunction?: () => void) => {
    const isFocused = useIsFocused();

    useEffect(() => {
        if (!cleanupFunction || isFocused) {
            return;
        }
        const state = navigationRef?.getRootState();
        const lastRoute = state?.routes.at(-1);
        const isRightModalOpening = lastRoute?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;

        if (isRightModalOpening) {
            return;
        }
        cleanupFunction();
    }, [isFocused, cleanupFunction]);
};

export default useCleanupSelectedOptions;
