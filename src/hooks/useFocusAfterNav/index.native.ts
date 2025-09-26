import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import type {RefObject} from 'react';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import CONST from '@src/CONST';

/** We added a delay to focus on text input to allow navigation/modal animations to get completed,
 *see issue https://github.com/Expensify/App/issues/65855 for more details
 */
const useFocusAfterNav = (ref: RefObject<AnimatedTextInputRef | null>) => {
    useFocusEffect(
        useCallback(() => {
            const timeoutId = setTimeout(() => {
                if (!ref.current) {
                    return;
                }
                ref.current.focus();
            }, CONST.ANIMATED_TRANSITION);

            return () => {
                clearTimeout(timeoutId);
            };
        }, [ref]),
    );
    return false;
};

export default useFocusAfterNav;
