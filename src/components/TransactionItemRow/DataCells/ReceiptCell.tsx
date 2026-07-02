import {Str} from 'expensify-common';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import type {ViewStyle} from 'react-native';
import ReceiptImage from '@components/ReceiptImage';
import ReceiptPreview from '@components/TransactionItemRow/ReceiptPreview';
import type {AnchorPosition} from '@components/TransactionItemRow/types';
import useHover from '@hooks/useHover';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {hasReceiptSource, isPerDiemRequest} from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import variables from '@styles/variables';
import type {Transaction} from '@src/types/onyx';

function ReceiptCell({
    transactionItem,
    isSelected,
    style,
    shouldUseNarrowLayout,
    shouldShowPreview = true,
}: {
    transactionItem: Transaction;
    isSelected: boolean;
    style?: ViewStyle;
    shouldUseNarrowLayout?: boolean;
    /** Whether the hovered receipt preview may be shown. Set to false to dismiss it (e.g. when the screen is no longer focused). */
    shouldShowPreview?: boolean;
}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const isLargeScreenWidth = !shouldUseNarrowLayout;
    const icons = useMemoizedLazyExpensifyIcons(['Receipt']);
    const backgroundStyles = isSelected ? StyleUtils.getBackgroundColorStyle(theme.buttonHoveredBG) : StyleUtils.getBackgroundColorStyle(theme.border);
    const {hovered, bind} = useHover();
    // Lazily mount ReceiptPreview on first hover and keep it mounted afterward.
    // ReceiptPreview handles its own visibility via debounced state, so keeping it
    // mounted avoids re-creating the portal and reloading images on subsequent hovers.
    const [shouldMountPreview, setShouldMountPreview] = useState(false);
    const cellRef = useRef<View>(null);
    // The preview is a document.body portal, so it needs the hovered cell's window position to
    // anchor itself beside the row instead of sitting fixed in the upper-left corner.
    const [previewAnchor, setPreviewAnchor] = useState<AnchorPosition>();

    const handleMouseEnter = () => {
        if (!shouldMountPreview) {
            setShouldMountPreview(true);
        }
        cellRef.current?.measureInWindow((left, top, width, height) => setPreviewAnchor({left, top, width, height}));
        bind.onMouseEnter();
    };

    const isMissingReceiptSource = !hasReceiptSource(transactionItem);
    const isEReceipt = transactionItem.hasEReceipt && isMissingReceiptSource;
    const isPerDiem = isPerDiemRequest(transactionItem) && isMissingReceiptSource;
    const receiptURIs = getThumbnailAndImageURIs(transactionItem, null, null);
    const filename = receiptURIs.filename ?? '';

    // Use 320px thumbnail for the receipt cell image
    const source = tryResolveUrlFromApiRoot(receiptURIs.thumbnail320 ?? receiptURIs.thumbnail ?? receiptURIs.image ?? '');

    // Use full size receipt image for the hovered preview
    const previewImageURI = Str.isImage(filename) ? receiptURIs.image : receiptURIs.thumbnail;
    const previewSource = tryResolveUrlFromApiRoot(previewImageURI ?? '');

    return (
        <View
            ref={cellRef}
            style={[
                StyleUtils.getWidthAndHeightStyle(isLargeScreenWidth ? variables.w28 : variables.h36, isLargeScreenWidth ? variables.h32 : variables.w40),
                StyleUtils.getBorderRadiusStyle(variables.componentBorderRadiusSmall),
                styles.overflowHidden,
                backgroundStyles,
                style,
            ]}
            onMouseEnter={handleMouseEnter}
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
            {shouldMountPreview && (
                <ReceiptPreview
                    source={previewSource}
                    hovered={hovered && shouldShowPreview}
                    isEReceipt={!!isEReceipt}
                    transactionItem={transactionItem}
                    anchorPosition={previewAnchor}
                />
            )}
        </View>
    );
}

export default ReceiptCell;
