import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import useStyleUtils from '@hooks/useStyleUtils';
import type SafeAreaConsumerProps from './types';

/**
 * This component is a light wrapper around the SafeAreaInsetsContext.Consumer. There are several places where we
 * may need not just the insets, but the computed styles so we save a few lines of code with this.
 */
function SafeAreaConsumer({children}: SafeAreaConsumerProps) {
    const StyleUtils = useStyleUtils();

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
