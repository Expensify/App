import React, {forwardRef, useEffect, useRef, useCallback} from 'react';
import {Keyboard} from 'react-native';
import _ from 'underscore';
import BaseOptionsList from './BaseOptionsList';
import withWindowDimensions from '../withWindowDimensions';
import {propTypes, defaultProps} from './optionsListPropTypes';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';

function OptionsList(props) {
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
            {..._.omit(props, 'forwardedRef')}
            ref={props.forwardedRef}
            onScroll={onScroll}
        />
    );
}

OptionsList.displayName = 'OptionsList';
OptionsList.propTypes = propTypes;
OptionsList.defaultProps = defaultProps;

export default withWindowDimensions(
    forwardRef((props, ref) => (
        <OptionsList
            forwardedRef={ref}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    )),
);
