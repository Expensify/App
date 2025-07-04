import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import {Receipt} from '@components/Icon/Expensicons';
import ReceiptImage from '@components/ReceiptImage';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFileName} from '@libs/fileDownload/FileUtils';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {hasReceiptSource} from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import variables from '@styles/variables';
import type {Transaction} from '@src/types/onyx';

function ReceiptCell({transactionItem, isSelected}: {transactionItem: Transaction; isSelected: boolean}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const backgroundStyles = isSelected ? StyleUtils.getBackgroundColorStyle(theme.buttonHoveredBG) : StyleUtils.getBackgroundColorStyle(theme.border);

    let source = transactionItem?.receipt?.source ?? '';

    if (source && typeof source === 'string') {
        const filename = getFileName(source);
        const receiptURIs = getThumbnailAndImageURIs(transactionItem, null, filename);
        const isReceiptPDF = Str.isPDF(filename);
        source = tryResolveUrlFromApiRoot(isReceiptPDF && !receiptURIs.isLocalFile ? (receiptURIs.thumbnail ?? '') : (receiptURIs.image ?? ''));
    }

    return (
        <View
            style={[
                StyleUtils.getWidthAndHeightStyle(variables.h36, variables.w40),
                StyleUtils.getBorderRadiusStyle(variables.componentBorderRadiusSmall),
                styles.overflowHidden,
                backgroundStyles,
            ]}
        >
            <ReceiptImage
                source={source}
                isEReceipt={transactionItem.hasEReceipt && !hasReceiptSource(transactionItem)}
                transactionID={transactionItem.transactionID}
                shouldUseThumbnailImage={!transactionItem?.receipt?.source}
                isAuthTokenRequired
                fallbackIcon={Receipt}
                fallbackIconSize={20}
                fallbackIconColor={theme.icon}
                fallbackIconBackground={isSelected ? theme.buttonHoveredBG : undefined}
                iconSize="x-small"
                loadingIconSize="small"
                loadingIndicatorStyles={styles.bgTransparent}
                transactionItem={transactionItem}
            />
        </View>
    );
}

ReceiptCell.displayName = 'ReceiptCell';
export default ReceiptCell;
