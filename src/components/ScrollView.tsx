import React from 'react';
import type {ForwardedRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import {ScrollView as RNScrollView} from 'react-native';
import type {ScrollViewProps as RNScrollViewProps} from 'react-native';
import useContentContainerStyleWithBottomSafeAreaPadding from '@hooks/useContentContainerStyleWithBottomSafeAreaPadding';

type ScrollViewProps = RNScrollViewProps & {
    /**
     * If enabled, the content will have a bottom padding equal to account for the safe bottom area inset.
     */
    addBottomSafeAreaPadding?: boolean;
};

function ScrollView(
    {children, scrollIndicatorInsets, contentContainerStyle: contentContainerStyleProp, addBottomSafeAreaPadding = false, ...props}: ScrollViewProps,
    ref: ForwardedRef<RNScrollView>,
) {
    const contentContainerStyle = useContentContainerStyleWithBottomSafeAreaPadding(addBottomSafeAreaPadding, contentContainerStyleProp);

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
