import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

function PDFThumbnailError() {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[styles.justifyContentCenter, styles.pdfErrorPlaceholder, styles.alignItemsCenter]}>
            <Icon
                src={Expensicons.ReceiptSlash}
                width={variables.receiptPlaceholderIconWidth}
                height={variables.receiptPlaceholderIconHeight}
                fill={theme.icon}
            />
        </View>
    );
}

export default PDFThumbnailError;
