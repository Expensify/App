import React, {useState, useEffect} from 'react';
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

    return (
        <FlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onScroll={() => {
                // Only dismiss the keyboard whenever the user scrolls the screen
                if (!isScreenTouched) {
                    return;
                }
                Keyboard.dismiss();
            }}
        />
    );
}

export default KeyboardDismissingFlatList;
