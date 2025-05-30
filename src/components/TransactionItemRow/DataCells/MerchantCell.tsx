import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import Parser from '@libs/Parser';
import StringUtils from '@libs/StringUtils';
import {getDescription, getMerchant, hasReceipt, isReceiptBeingScanned} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {TransactionWithOptionalSearchFields} from '..';

/** If merchant name is empty or (none), then it it falls back to description if screen is narrow */
function getMerchantNameWithFallback(transactionItem: TransactionWithOptionalSearchFields, translate: (key: TranslationPaths) => string, shouldUseNarrowLayout?: boolean | undefined) {
    const shouldShowMerchant = transactionItem.shouldShowMerchant ?? true;
    const description = getDescription(transactionItem);
    let merchantOrDescriptionToDisplay = transactionItem?.formattedMerchant ?? getMerchant(transactionItem);
    if ((!merchantOrDescriptionToDisplay || merchantOrDescriptionToDisplay === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT) && shouldUseNarrowLayout) {
        merchantOrDescriptionToDisplay = Parser.htmlToText(description);
    }
    let merchant = shouldShowMerchant ? merchantOrDescriptionToDisplay : Parser.htmlToText(description);

    if (hasReceipt(transactionItem) && isReceiptBeingScanned(transactionItem) && shouldShowMerchant) {
        merchant = translate('iou.receiptStatusTitle');
    }
    const merchantName = StringUtils.getFirstLine(merchant);
    return merchant !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT ? merchantName : '';
}

function MerchantOrDescriptionCell({
    merchantOrDescription,
    shouldShowTooltip,
    shouldUseNarrowLayout,
}: {
    merchantOrDescription: string;
    shouldUseNarrowLayout?: boolean | undefined;
    shouldShowTooltip: boolean;
}) {
    const styles = useThemeStyles();

    return (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={merchantOrDescription}
            style={[!shouldUseNarrowLayout ? styles.lineHeightLarge : styles.lh20, styles.pre, styles.justifyContentCenter]}
        />
    );
}

MerchantOrDescriptionCell.displayName = 'MerchantOrDescriptionCell';
export default MerchantOrDescriptionCell;
export {getMerchantNameWithFallback};
