import useIsMobileWebLandscape from '@hooks/useIsMobileWebLandscape';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PropsWithChildren} from 'react';

import React from 'react';
import {View} from 'react-native';

function ComposerFooter({children}: PropsWithChildren) {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isOffline} = useNetwork();
    // Shorter report header and compose row on mobile web in landscape, where vertical space is scarce.
    const shouldUseCompactChrome = useIsMobileWebLandscape();

    const secondaryRowStyle = shouldUseCompactChrome ? styles.chatItemComposeSecondaryRowCompact : styles.chatItemComposeSecondaryRow;

    return (
        <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, (!isSmallScreenWidth || (isSmallScreenWidth && !isOffline)) && secondaryRowStyle]}>
            {children}
        </View>
    );
}

export default ComposerFooter;
