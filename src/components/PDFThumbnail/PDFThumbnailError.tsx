import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

function PDFThumbnailError() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['ReceiptSlash']);

    return (
        <View style={[styles.justifyContentCenter, styles.pdfErrorPlaceholder, styles.alignItemsCenter]}>
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
