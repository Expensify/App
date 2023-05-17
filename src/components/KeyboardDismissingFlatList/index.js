import React, {Component} from 'react';
import {FlatList, Keyboard} from 'react-native';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';

class KeyboardDismissingFlatList extends Component {
    constructor(props) {
        super(props);

        this.touchStart = this.touchStart.bind(this);
        this.touchEnd = this.touchEnd.bind(this);
    }

    componentDidMount() {
        if (!DeviceCapabilities.canUseTouchScreen()) {
            return;
        }

        // We're setting `isScreenTouched` in this listener only for web platforms with touchscreen (mWeb) where
        // we want to dismiss the keyboard only when the list is scrolled by the user and not when it's scrolled programmatically.
        document.addEventListener('touchstart', this.touchStart);
        document.addEventListener('touchend', this.touchEnd);
    }

    componentWillUnmount() {
        if (!DeviceCapabilities.canUseTouchScreen()) {
            return;
        }

        document.removeEventListener('touchstart', this.touchStart);
        document.removeEventListener('touchend', this.touchEnd);
    }

    touchStart() {
        this.isScreenTouched = true;
    }

    touchEnd() {
        this.isScreenTouched = false;
    }

    render() {
        return (
            <FlatList
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                onScroll={() => {
                    // Only dismiss the keyboard whenever the user scrolls the screen
                    if (!this.isScreenTouched) {
                        return;
                    }
                    Keyboard.dismiss();
                }}
            />
        );
    }
}

export default KeyboardDismissingFlatList;
