import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import ReceiptImage from '@components/ReceiptImage';
import type {TransactionListItemType} from '@components/SelectionList/types';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFileName} from '@libs/fileDownload/FileUtils';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import variables from '@styles/variables';

type CellProps = {
    // eslint-disable-next-line react/no-unused-prop-types
    showTooltip: boolean;
    // eslint-disable-next-line react/no-unused-prop-types
    isLargeScreenWidth: boolean;
};

type TransactionCellProps = {
    transactionItem: TransactionListItemType;
} & CellProps;


function ReceiptCell({transactionItem}: TransactionCellProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const backgroundStyles = transactionItem.isSelected ? StyleUtils.getBackgroundColorStyle(theme.buttonHoveredBG) : StyleUtils.getBackgroundColorStyle(theme.border);

    let source = transactionItem?.receipt?.source ?? '';
    if (source && typeof source === 'string') {
        const filename = getFileName(source);
        const receiptURIs = getThumbnailAndImageURIs(transactionItem, null, filename);
        const isReceiptPDF = Str.isPDF(filename);
        source = tryResolveUrlFromApiRoot(isReceiptPDF && !receiptURIs.isLocalFile ? receiptURIs.thumbnail ?? '' : receiptURIs.image ?? '');
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
    isEReceipt={transactionItem.hasEReceipt}
    transactionID={transactionItem.transactionID}
    shouldUseThumbnailImage={!transactionItem?.receipt?.source}
    isAuthTokenRequired
    fallbackIcon={Expensicons.Receipt}
    fallbackIconSize={20}
    fallbackIconColor={theme.icon}
    fallbackIconBackground={transactionItem.isSelected ? theme.buttonHoveredBG : undefined}
    iconSize="x-small"
        />
        </View>
);
}

ReceiptCell.displayName = 'ReceiptCell';

export default ReceiptCell;
