import React, {useState, useEffect, useCallback} from 'react';
import {FlatList, Keyboard} from 'react-native';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';

function KeyboardDismissingFlatList(props) {
    const [isScreenTouched, setIsScreenTouched] = useState(false);

    const touchStart = () => {
        setIsScreenTouched(true);
    };

    const touchEnd = () => {
        setIsScreenTouched(false);
    };

    useEffect(() => {
        if (!DeviceCapabilities.canUseTouchScreen()) {
            return;
        }

        document.addEventListener('touchstart', touchStart);
        document.addEventListener('touchend', touchEnd);

        return () => {
            document.removeEventListener('touchstart', touchStart);
            document.removeEventListener('touchend', touchEnd);
        };
    }, []);

    const onScroll = useCallback(() => {
        // Only dismiss the keyboard whenever the user scrolls the screen
        if (!isScreenTouched) {
            return;
        }
        Keyboard.dismiss();
    }, [isScreenTouched]);

    return (
        <FlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onScroll={onScroll}
        />
    );
}

export default KeyboardDismissingFlatList;
