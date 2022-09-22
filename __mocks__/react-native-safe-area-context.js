import React, {forwardRef} from 'react';
import {View} from 'react-native';

const insets = {
    top: 0, right: 0, bottom: 0, left: 0,
};

function withSafeAreaInsets(WrappedComponent) {
    const WithSafeAreaInsets = props => (
        <WrappedComponent
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            // eslint-disable-next-line react/prop-types
            ref={props.forwardedRef}
            insets={insets}
        />
    );
    return forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithSafeAreaInsets {...props} forwardedRef={ref} />
    ));
}

const SafeAreaView = View;
const SafeAreaProvider = props => props.children;
const SafeAreaConsumer = props => props.children(insets);
const SafeAreaInsetsContext = {
    Consumer: SafeAreaConsumer,
};

const useSafeAreaFrame = jest.fn(() => ({
    x: 0, y: 0, width: 390, height: 844,
}));
const useSafeAreaInsets = jest.fn(() => insets);

export {
    SafeAreaProvider,
    SafeAreaConsumer,
    SafeAreaInsetsContext,
    withSafeAreaInsets,
    SafeAreaView,
    useSafeAreaFrame,
    useSafeAreaInsets,
};
