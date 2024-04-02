import {useLayoutEffect} from 'react';
import type {RefObject} from 'react';
import type {View} from 'react-native';

const useSyncFocus = (ref: RefObject<HTMLDivElement | View>, isFocused: boolean) => {
    // Sync focus on an item
    useLayoutEffect(() => {
        if (!isFocused) {
            return;
        }

        ref?.current?.focus();
    }, [isFocused, ref]);
};

export default useSyncFocus;
