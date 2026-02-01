import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import type {ViewStyle} from 'react-native';
import ReceiptImage from '@components/ReceiptImage';
import ReceiptPreview from '@components/TransactionItemRow/ReceiptPreview';
import useHover from '@hooks/useHover';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFileName} from '@libs/fileDownload/FileUtils';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {hasReceiptSource, isPerDiemRequest} from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import variables from '@styles/variables';
import type {Transaction} from '@src/types/onyx';

function ReceiptCell({transactionItem, isSelected, style}: {transactionItem: Transaction; isSelected: boolean; style?: ViewStyle}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['Receipt']);
    const backgroundStyles = isSelected ? StyleUtils.getBackgroundColorStyle(theme.buttonHoveredBG) : StyleUtils.getBackgroundColorStyle(theme.border);
    const {hovered, bind} = useHover();
    const isMissingReceiptSource = !hasReceiptSource(transactionItem);
    const isEReceipt = transactionItem.hasEReceipt && isMissingReceiptSource;
    const isPerDiem = isPerDiemRequest(transactionItem) && isMissingReceiptSource;
    let source = transactionItem?.receipt?.source ?? '';
    let previewSource = transactionItem?.receipt?.source ?? '';

    if (source && typeof source === 'string') {
        const filename = getFileName(source);
        const receiptURIs = getThumbnailAndImageURIs(transactionItem, null, filename);

        // Use the smaller 320px thumbnail for the cell's receipt image
        source = tryResolveUrlFromApiRoot(receiptURIs.thumbnail320 ?? receiptURIs.image ?? '');

        // Use regular 1024px for the hovered preview thumbanil
        const previewImageURI = Str.isImage(filename) ? receiptURIs.image : receiptURIs.thumbnail;
        previewSource = tryResolveUrlFromApiRoot(previewImageURI ?? '');
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
                shouldUseThumbnailImage
                thumbnailContainerStyles={styles.bgTransparent}
                isAuthTokenRequired
                fallbackIcon={icons.Receipt}
                fallbackIconSize={20}
                fallbackIconColor={theme.icon}
                fallbackIconBackground={isSelected ? theme.buttonHoveredBG : undefined}
                iconSize="x-small"
                loadingIconSize="small"
                loadingIndicatorStyles={styles.receiptCellLoadingContainer}
                transactionItem={transactionItem}
                shouldUseInitialObjectPosition
                isPerDiemRequest={isPerDiem}
            />
            <ReceiptPreview
                source={previewSource}
                hovered={hovered}
                isEReceipt={!!isEReceipt}
                transactionItem={transactionItem}
            />
        </View>
    );
}

export default ReceiptCell;
