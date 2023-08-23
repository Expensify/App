import React, {forwardRef, useEffect, useState} from 'react';
import {Keyboard} from 'react-native';
import BaseSelectionList from './BaseSelectionList';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';

const SelectionList = forwardRef((props, ref) => {
    const [isScreenTouched, setIsScreenTouched] = useState(false);

    const touchStart = () => setIsScreenTouched(true);
    const touchEnd = () => setIsScreenTouched(false);

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

    return (
        <BaseSelectionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            onScroll={() => {
                // Only dismiss the keyboard whenever the user scrolls the screen
                if (!isScreenTouched) {
                    return;
                }
                Keyboard.dismiss();
            }}
        />
    );
});

SelectionList.displayName = 'SelectionList';

export default SelectionList;
