import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import type {RefObject} from 'react';
import type {AnimatedTextInputRef} from '@components/RNTextInput';

/** We added a delay to focus on text input to allow navigation/modal animations to get completed,
 *see issue https://github.com/Expensify/App/issues/65855 for more details
 */
const useFocusAfterNav = (ref: RefObject<AnimatedTextInputRef | null>) => {
    useFocusEffect(
        useCallback(() => {
            requestAnimationFrame(() => {
                if (!ref.current) {
                    return;
                }
                ref.current.focus();
            });
        }, [ref]),
    );
    return false;
};

export default useFocusAfterNav;
