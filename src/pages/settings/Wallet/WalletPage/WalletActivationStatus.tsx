import Icon from '@components/Icon';
import Text from '@components/Text';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';
import {View} from 'react-native';

type WalletActivationStatusProps = {
    /** Icon shown next to the status message */
    icon: IconAsset;

    /** Status message, e.g. activation pending or failed */
    text: string;
};

/**
 * Inline status row shown in the Expensify Wallet section while Onfido verification is pending or after it failed.
 */
function WalletActivationStatus({icon, text}: WalletActivationStatusProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.w100]}>
            <Icon
                src={icon}
                fill={theme.icon}
            />
            <Text style={[styles.inlineSystemMessage, styles.flexShrink1]}>{text}</Text>
        </View>
    );
}

export default WalletActivationStatus;
