import {useIsFocused} from '@react-navigation/native';
import type {MutableRefObject} from 'react';
import {useEffect, useRef} from 'react';
import type {TextInput} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import usePrevious from './usePrevious';

export default function useResetComposerFocus(inputRef: MutableRefObject<TextInput | null>) {
    const isFocused = useIsFocused();
    const shouldResetFocusRef = useRef(false);
    const [modal] = useOnyx(ONYXKEYS.MODAL);
    const prevIsModalVisible = usePrevious(modal?.isVisible);

    useEffect(() => {
        if (!isFocused || !shouldResetFocusRef.current || prevIsModalVisible) {
            return;
        }
        inputRef.current?.focus(); // focus input again
        shouldResetFocusRef.current = false;
    }, [isFocused, inputRef, prevIsModalVisible]);

    return {isFocused, shouldResetFocusRef};
}
