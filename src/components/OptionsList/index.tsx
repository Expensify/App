import React, {ForwardedRef, forwardRef, useCallback, useEffect, useRef} from 'react';
import {Keyboard, SectionList as RNSectionList} from 'react-native';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import BaseOptionsList from './BaseOptionsList';
import {OptionsListProps} from './types';

function OptionsList(props: OptionsListProps, ref: ForwardedRef<RNSectionList>) {
    const isScreenTouched = useRef(false);

    useEffect(() => {
        if (!DeviceCapabilities.canUseTouchScreen()) {
            return;
        }

        const touchStart = () => {
            isScreenTouched.current = true;
        };
        const touchEnd = () => {
            isScreenTouched.current = false;
        };

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
        <BaseOptionsList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            onScroll={onScroll}
        />
    );
}

OptionsList.displayName = 'OptionsList';

export default forwardRef(OptionsList);
