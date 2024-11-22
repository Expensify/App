import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import useStyleUtils from '@hooks/useStyleUtils';
import StatusBar from '@libs/StatusBar';
import type SafeAreaConsumerProps from './types';

const defaultInsets = {top: 0, bottom: 0, left: 0, right: 0};

/**
 * This component is a light wrapper around the SafeAreaInsetsContext.Consumer. There are several places where we
 * may need not just the insets, but the computed styles so we save a few lines of code with this.
 */
function SafeAreaConsumer({children}: SafeAreaConsumerProps) {
    const StyleUtils = useStyleUtils();

    return (
        <SafeAreaInsetsContext.Consumer>
            {(insets) => {
                const safeInsets = insets ?? defaultInsets;

                const androidInsets = {
                    ...safeInsets,
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    top: StatusBar.currentHeight || safeInsets.top,
                };

                const {paddingTop, paddingBottom} = StyleUtils.getSafeAreaPadding(androidInsets);

                return children({
                    paddingTop,
                    paddingBottom,
                    insets: androidInsets,
                    safeAreaPaddingBottomStyle: {paddingBottom},
                });
            }}
        </SafeAreaInsetsContext.Consumer>
    );
}

SafeAreaConsumer.displayName = 'SafeAreaConsumer';

export default SafeAreaConsumer;
