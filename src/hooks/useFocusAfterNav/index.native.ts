import {useFocusEffect} from '@react-navigation/native';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import CONST from '@src/CONST';
import type UseFocusAfterNav from './type';

/** We added a delay to focus on text input to allow navigation/modal animations to get completed,
see issue https://github.com/Expensify/App/issues/65855 for more details */
const useFocusAfterNav: UseFocusAfterNav = (ref, shouldDelayFocus = true) => {
    const isInLandscapeMode = useIsInLandscapeMode();

    useFocusEffect(() => {
        if (!shouldDelayFocus || isInLandscapeMode) {
            return;
        }

        const timeoutId = setTimeout(() => {
            ref.current?.focus();
        }, CONST.ANIMATED_TRANSITION);

        return () => clearTimeout(timeoutId);
    });
    return false;
};

export default useFocusAfterNav;
