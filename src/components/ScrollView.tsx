import React from 'react';
import type {ForwardedRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import {ScrollView as RNScrollView} from 'react-native';
import type {ScrollViewProps as RNScrollViewProps} from 'react-native';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';

type ScrollViewProps = RNScrollViewProps & {
    /** Whether to add bottom safe area padding to the content. */
    addBottomSafeAreaPadding?: boolean;

    /** Whether to add bottom safe area padding to the content. */
    addOfflineIndicatorBottomSafeAreaPadding?: boolean;
};

function ScrollView(
    {
        children,
        scrollIndicatorInsets,
        contentContainerStyle: contentContainerStyleProp,
        addBottomSafeAreaPadding = false,
        addOfflineIndicatorBottomSafeAreaPadding = addBottomSafeAreaPadding,
        ...props
    }: ScrollViewProps,
    ref: ForwardedRef<RNScrollView>,
) {
    const contentContainerStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding,
        addOfflineIndicatorBottomSafeAreaPadding,
        style: contentContainerStyleProp,
    });

    return (
        <RNScrollView
            ref={ref}
            // on iOS, navigation animation sometimes cause the scrollbar to appear
            // on middle/left side of scrollview. scrollIndicatorInsets with right
            // to closest value to 0 fixes this issue, 0 (default) doesn't work
            // See: https://github.com/Expensify/App/issues/31441
            contentContainerStyle={contentContainerStyle}
            scrollIndicatorInsets={scrollIndicatorInsets ?? {right: Number.MIN_VALUE}}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {children}
        </RNScrollView>
    );
}

ScrollView.displayName = 'ScrollView';

export type {ScrollViewProps};

export default React.forwardRef(ScrollView);
