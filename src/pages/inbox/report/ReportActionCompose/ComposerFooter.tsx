import React from 'react';
import {View} from 'react-native';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

type ComposerFooterProps = {
    children: React.ReactNode;
};

function ComposerFooter({children}: ComposerFooterProps) {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isOffline} = useNetwork();

    return (
        <View
            style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, (!isSmallScreenWidth || (isSmallScreenWidth && !isOffline)) && styles.chatItemComposeSecondaryRow]}
        >
            {children}
        </View>
    );
}

export default ComposerFooter;
