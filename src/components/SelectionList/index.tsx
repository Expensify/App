import React, {forwardRef, useEffect, useState} from 'react';
import type {ForwardedRef} from 'react';
import {Keyboard} from 'react-native';
import type {TextInput} from 'react-native';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import BaseSelectionList from './BaseSelectionList';
import type {BaseSelectionListProps} from './types';

function SelectionList(props: BaseSelectionListProps, ref: ForwardedRef<TextInput>) {
    const [isScreenTouched, setIsScreenTouched] = useState(false);

    const touchStart = () => setIsScreenTouched(true);
    const touchEnd = () => setIsScreenTouched(false);

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
        <BaseSelectionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            onScroll={() => {
                if (!isScreenTouched) {
                    return;
                }
                Keyboard.dismiss();
            }}
        />
    );
}

SelectionList.displayName = 'SelectionListFunction';

export default forwardRef(SelectionList);
