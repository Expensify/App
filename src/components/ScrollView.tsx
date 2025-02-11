import React from 'react';
import type {ForwardedRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import {ScrollView as RNScrollView} from 'react-native';
import type {ScrollViewProps} from 'react-native';
import useScrollEnabled from '@hooks/useScrollEnabled';

function ScrollView({children, scrollIndicatorInsets, scrollEnabled: RNScrollEnabled, ...props}: ScrollViewProps, ref: ForwardedRef<RNScrollView>) {
    const scrollEnabled = useScrollEnabled(RNScrollEnabled);

    return (
        <RNScrollView
            ref={ref}
            // on iOS, navigation animation sometimes cause the scrollbar to appear
            // on middle/left side of scrollview. scrollIndicatorInsets with right
            // to closest value to 0 fixes this issue, 0 (default) doesn't work
            // See: https://github.com/Expensify/App/issues/31441
            scrollIndicatorInsets={scrollIndicatorInsets ?? {right: Number.MIN_VALUE}}
            scrollEnabled={scrollEnabled}
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
