import React, {useRef, useEffect, useCallback} from 'react';
import {FlatList, Keyboard} from 'react-native';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';

function KeyboardDismissingFlatList(props) {
    const isScreenTouched = useRef(false);

    const touchStart = () => {
        isScreenTouched.current = true;
    };

    const touchEnd = () => {
        isScreenTouched.current = false;
    };

    useEffect(() => {
        if (!DeviceCapabilities.canUseTouchScreen()) {
            return;
        }

        // We're setting `isScreenTouched` in this listener only for web platforms with touchscreen (mWeb) where
        // we want to dismiss the keyboard only when the list is scrolled by the user and not when it's scrolled programmatically.
        document.addEventListener('touchstart', touchStart);
        document.addEventListener('touchend', touchEnd);

        return () => {
            document.removeEventListener('touchstart', touchStart);
            document.removeEventListener('touchend', touchEnd);
        };
    }, []);

    const onScroll = useCallback(() => {
        // Only dismiss the keyboard whenever the user scrolls the screen
        if (!isScreenTouched.current) {
            return;
        }
        Keyboard.dismiss();
    }, []);

    return (
        <FlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onScroll={onScroll}
        />
    );
}

KeyboardDismissingFlatList.displayName = 'KeyboardDismissingFlatList';

export default KeyboardDismissingFlatList;
