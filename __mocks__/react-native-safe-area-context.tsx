import type {ForwardedRef, ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import type {EdgeInsets, useSafeAreaFrame as LibUseSafeAreaFrame, WithSafeAreaInsetsProps} from 'react-native-safe-area-context';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type SafeAreaProviderProps = ChildrenProps;
type SafeAreaConsumerProps = {
    children?: (insets: EdgeInsets) => ReactNode;
};
type SafeAreaInsetsContextValue = {
    Consumer: (props: SafeAreaConsumerProps) => ReactNode;
};

const insets: EdgeInsets = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
};

function withSafeAreaInsets(WrappedComponent: React.ComponentType<WithSafeAreaInsetsProps & {ref: ForwardedRef<unknown>}>) {
    function WithSafeAreaInsets(props: WithSafeAreaInsetsProps & {ref: React.ForwardedRef<unknown>}) {
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                // eslint-disable-next-line react/prop-types
                ref={props.ref}
                insets={insets}
            />
        );
    }

    function WithSafeAreaInsetsWithRef(props: WithSafeAreaInsetsProps & {ref: ForwardedRef<unknown>}) {
        return (
            <WithSafeAreaInsets
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={props.ref}
            />
        );
    }

    return WithSafeAreaInsetsWithRef;
}

const SafeAreaView = View;
const SafeAreaProvider = (props: SafeAreaProviderProps) => props.children;
const SafeAreaConsumer = (props: SafeAreaConsumerProps) => props.children?.(insets);
const SafeAreaInsetsContext: SafeAreaInsetsContextValue = {
    Consumer: SafeAreaConsumer,
};

const useSafeAreaFrame: jest.Mock<ReturnType<typeof LibUseSafeAreaFrame>> = jest.fn(() => ({
    x: 0,
    y: 0,
    width: 390,
    height: 844,
}));
const useSafeAreaInsets: jest.Mock<EdgeInsets> = jest.fn(() => insets);

export {SafeAreaProvider, SafeAreaConsumer, SafeAreaInsetsContext, withSafeAreaInsets, SafeAreaView, useSafeAreaFrame, useSafeAreaInsets};
