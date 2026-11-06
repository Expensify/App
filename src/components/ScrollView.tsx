import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';

import type {ComponentRef, ForwardedRef} from 'react';
import type {ScrollViewProps as RNScrollViewProps} from 'react-native';

import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {ScrollView as RNScrollView} from 'react-native';

type ScrollViewProps = RNScrollViewProps & {
    addBottomSafeAreaPadding?: boolean;
    addOfflineIndicatorBottomSafeAreaPadding?: boolean;
    ref?: ForwardedRef<ComponentRef<typeof RNScrollView>>;
};

function ScrollView({children, contentContainerStyle: contentContainerStyleProp, addBottomSafeAreaPadding, addOfflineIndicatorBottomSafeAreaPadding, ref, ...props}: ScrollViewProps) {
    const contentContainerStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding,
        addOfflineIndicatorBottomSafeAreaPadding,
        style: contentContainerStyleProp,
    });

    return (
        <RNScrollView
            ref={ref}
            contentContainerStyle={contentContainerStyle}
            {...props}
        >
            {children}
        </RNScrollView>
    );
}

export type {ScrollViewProps};

export default ScrollView;
