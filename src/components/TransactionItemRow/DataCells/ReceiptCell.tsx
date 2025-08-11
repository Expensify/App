import React from 'react';
import {View} from 'react-native';
import type {ViewStyle} from 'react-native';
import {Receipt} from '@components/Icon/Expensicons';
import ReceiptImage from '@components/ReceiptImage';
import ReceiptPreview from '@components/TransactionItemRow/ReceiptPreview';
import useHover from '@hooks/useHover';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFileName} from '@libs/fileDownload/FileUtils';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {hasReceiptSource} from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import variables from '@styles/variables';
import type {Transaction} from '@src/types/onyx';

function ReceiptCell({transactionItem, isSelected, style}: {transactionItem: Transaction; isSelected: boolean; style?: ViewStyle}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const backgroundStyles = isSelected ? StyleUtils.getBackgroundColorStyle(theme.buttonHoveredBG) : StyleUtils.getBackgroundColorStyle(theme.border);
    const {hovered, bind} = useHover();
    const isEReceipt = transactionItem.hasEReceipt && !hasReceiptSource(transactionItem);
    let source = transactionItem?.receipt?.source ?? '';
    if (source) {
        const filename = getFileName(source);
        const receiptURIs = getThumbnailAndImageURIs(transactionItem, null, filename);
        source = tryResolveUrlFromApiRoot(receiptURIs.thumbnail ?? receiptURIs.image ?? '');
    }

    return (
        <View
            style={[
                StyleUtils.getWidthAndHeightStyle(variables.h36, variables.w40),
                StyleUtils.getBorderRadiusStyle(variables.componentBorderRadiusSmall),
                styles.overflowHidden,
                backgroundStyles,
                style,
            ]}
            onMouseEnter={bind.onMouseEnter}
            onMouseLeave={bind.onMouseLeave}
        >
            <ReceiptImage
                source={source}
                isEReceipt={isEReceipt}
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
            <ReceiptPreview
                source={source}
                hovered={hovered}
                isEReceipt={!!isEReceipt}
                transactionItem={transactionItem}
            />
        </View>
    );
}

ReceiptCell.displayName = 'ReceiptCell';
export default ReceiptCell;
