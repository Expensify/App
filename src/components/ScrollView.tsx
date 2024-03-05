import React from 'react';
import type {ForwardedRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import {ScrollView as RNScrollView} from 'react-native';
import type {ScrollViewProps as RNScrollViewProps} from 'react-native';

type ScrollViewProps = RNScrollViewProps & {
    /** whether to add right inset from the edges of the scroll view on iOS */
    shouldAddRightInsetForIndicator?: boolean;
};

function ScrollView({children, scrollIndicatorInsets, shouldAddRightInsetForIndicator = true, ...props}: ScrollViewProps, ref: ForwardedRef<RNScrollView>) {
    return (
        <RNScrollView
            ref={ref}
            scrollIndicatorInsets={scrollIndicatorInsets ?? (shouldAddRightInsetForIndicator ? {right: Number.MIN_VALUE} : undefined)}
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
