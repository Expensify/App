import Icon from '@components/Icon';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type PDFThumbnailErrorProps = {
    /** Additional styles applied to the placeholder container (e.g. to widen it past its default max width) */
    style?: StyleProp<ViewStyle>;
};

function PDFThumbnailError({style}: PDFThumbnailErrorProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['ReceiptSlash']);

    return (
        <View style={[styles.justifyContentCenter, styles.pdfErrorPlaceholder, styles.alignItemsCenter, style]}>
            <Icon
                src={icons.ReceiptSlash}
                width={variables.receiptPlaceholderIconWidth}
                height={variables.receiptPlaceholderIconHeight}
                fill={theme.icon}
            />
        </View>
    );
}

export default PDFThumbnailError;
