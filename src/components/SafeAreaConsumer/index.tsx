import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import useStyleUtils from '@hooks/useStyleUtils';
import type SafeAreaConsumerProps from './types';

/**
 * This component is a light wrapper around the SafeAreaInsetsContext.Consumer. There are several places where we
 * may need not just the insets, but the computed styles so we save a few lines of code with this.
 * Note: if you're working within a <ScreenWrapper> please use `useStyledSafeAreaInsets` instead.
 */
function SafeAreaConsumer({children}: SafeAreaConsumerProps) {
    const StyleUtils = useStyleUtils();

    return (
        <SafeAreaInsetsContext.Consumer>
            {(safeAreaInsets) => {
                const insets = StyleUtils.getSafeAreaInsets(safeAreaInsets);
                const {paddingTop, paddingBottom} = StyleUtils.getSafeAreaPadding(insets);

                return children({
                    paddingTop,
                    paddingBottom,
                    insets,
                    safeAreaPaddingBottomStyle: {paddingBottom},
                });
            }}
        </SafeAreaInsetsContext.Consumer>
    );
}

SafeAreaConsumer.displayName = 'SafeAreaConsumer';

export default SafeAreaConsumer;
