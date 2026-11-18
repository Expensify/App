import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';

import type {ComponentRef, ForwardedRef} from 'react';
import type {ScrollViewProps as RNScrollViewProps} from 'react-native';

import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {ScrollView as RNScrollView} from 'react-native';

import HorizontalSafeAreaContext from './HorizontalSafeArea/HorizontalSafeAreaContext';
import useHorizontalSafeAreaBleed from './HorizontalSafeArea/useHorizontalSafeAreaBleed';

type ScrollViewProps = RNScrollViewProps & {
    addBottomSafeAreaPadding?: boolean;
    addOfflineIndicatorBottomSafeAreaPadding?: boolean;
    ref?: ForwardedRef<ComponentRef<typeof RNScrollView>>;
};

function ScrollView({
    children,
    style: styleProp,
    contentContainerStyle: contentContainerStyleProp,
    addBottomSafeAreaPadding,
    addOfflineIndicatorBottomSafeAreaPadding,
    ref,
    ...props
}: ScrollViewProps) {
    const bottomSafeAreaContentContainerStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding,
        addOfflineIndicatorBottomSafeAreaPadding,
        style: contentContainerStyleProp,
    });
    const {style, contentContainerStyle, contentPlacement} = useHorizontalSafeAreaBleed({
        style: styleProp,
        contentContainerStyle: bottomSafeAreaContentContainerStyle,
        horizontal: props.horizontal,
    });

    return (
        <HorizontalSafeAreaContext.Provider value={contentPlacement}>
            <RNScrollView
                ref={ref}
                style={style}
                contentContainerStyle={contentContainerStyle}
                {...props}
            >
                {children}
            </RNScrollView>
        </HorizontalSafeAreaContext.Provider>
    );
}

export type {ScrollViewProps};

export default ScrollView;
