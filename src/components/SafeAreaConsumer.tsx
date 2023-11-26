import React from 'react';
import type {DimensionValue} from 'react-native';
import {EdgeInsets, SafeAreaInsetsContext} from 'react-native-safe-area-context';
import * as StyleUtils from '@styles/StyleUtils';

type ChildrenProps = {
    paddingTop?: DimensionValue;
    paddingBottom?: DimensionValue;
    insets?: EdgeInsets;
    safeAreaPaddingBottomStyle: {
        paddingBottom?: DimensionValue;
    };
};

type SafeAreaConsumerProps = {
    children: React.FC<ChildrenProps>;
};

/**
 * This component is a light wrapper around the SafeAreaInsetsContext.Consumer. There are several places where we
 * may need not just the insets, but the computed styles so we save a few lines of code with this.
 */
function SafeAreaConsumer({children}: SafeAreaConsumerProps) {
    return (
        <SafeAreaInsetsContext.Consumer>
            {(insets) => {
                const {paddingTop, paddingBottom} = StyleUtils.getSafeAreaPadding(insets ?? undefined);
                return children({
                    paddingTop,
                    paddingBottom,
                    insets: insets ?? undefined,
                    safeAreaPaddingBottomStyle: {paddingBottom},
                });
            }}
        </SafeAreaInsetsContext.Consumer>
    );
}

SafeAreaConsumer.displayName = 'SafeAreaConsumer';

export default SafeAreaConsumer;
