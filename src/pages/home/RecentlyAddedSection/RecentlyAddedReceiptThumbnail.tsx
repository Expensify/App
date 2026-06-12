import React from 'react';
import {View} from 'react-native';
import ReceiptImage from '@components/ReceiptImage';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {hasReceiptSource, isPerDiemRequest} from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import variables from '@styles/variables';
import type {Transaction} from '@src/types/onyx';

const THUMBNAIL_SIZE = 40;
const FALLBACK_ICON_SIZE = 20;

/** Renders a transaction's receipt thumbnail, falling back to a type-appropriate icon when no receipt image exists. */
function RecentlyAddedReceiptThumbnail({transaction}: {transaction: Transaction}) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['Receipt']);

    const isMissingReceiptSource = !hasReceiptSource(transaction);
    const isEReceipt = !!transaction.hasEReceipt && isMissingReceiptSource;
    const isPerDiem = isPerDiemRequest(transaction) && isMissingReceiptSource;
    const receiptURIs = getThumbnailAndImageURIs(transaction, null, null);
    const source = tryResolveUrlFromApiRoot(receiptURIs.thumbnail320 ?? receiptURIs.thumbnail ?? receiptURIs.image ?? '');

    return (
        <View
            style={[
                StyleUtils.getWidthAndHeightStyle(THUMBNAIL_SIZE, THUMBNAIL_SIZE),
                StyleUtils.getBorderRadiusStyle(variables.componentBorderRadiusSmall),
                styles.overflowHidden,
                StyleUtils.getBackgroundColorStyle(theme.border),
            ]}
        >
            <ReceiptImage
                source={source}
                isEReceipt={isEReceipt}
                transactionID={transaction.transactionID}
                shouldUseThumbnailImage
                isAuthTokenRequired
                fallbackIcon={icons.Receipt}
                fallbackIconSize={FALLBACK_ICON_SIZE}
                fallbackIconColor={theme.icon}
                iconSize="x-small"
                transactionItem={transaction}
                isPerDiemRequest={isPerDiem}
            />
        </View>
    );
}

export default RecentlyAddedReceiptThumbnail;
