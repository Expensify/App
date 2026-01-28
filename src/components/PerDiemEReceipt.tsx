import React from 'react';
import {View} from 'react-native';
import useCurrencyList from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertAmountToDisplayString, convertToDisplayStringWithoutCurrency} from '@libs/CurrencyUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getTransactionDetails} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionCustomUnit} from '@src/types/onyx/Transaction';
import EReceiptThumbnail from './EReceiptThumbnail';
import Icon from './Icon';
import Text from './Text';

type PerDiemEReceiptProps = {
    /* TransactionID of the transaction this EReceipt corresponds to */
    transactionID: string;
};

function computeDefaultPerDiemExpenseRates(customUnit: TransactionCustomUnit, currency: string) {
    const subRates = customUnit.subRates ?? [];
    const subRateComments = subRates.map((subRate) => {
        const rate = subRate.rate ?? 0;
        const rateComment = subRate.name ?? '';
        const quantity = subRate.quantity ?? 0;
        return `${quantity}x ${rateComment} @ ${convertAmountToDisplayString(rate, currency)}`;
    });
    return subRateComments.join(', ');
}

function getPerDiemDestination(merchant: string) {
    const merchantParts = merchant.split(', ');
    if (merchantParts.length < 3) {
        return '';
    }
    return merchantParts.slice(0, merchantParts.length - 3).join(', ');
}

function getPerDiemDates(merchant: string) {
    const merchantParts = merchant.split(', ');
    if (merchantParts.length < 3) {
        return merchant;
    }
    return merchantParts.slice(-3).join(', ');
}

function PerDiemEReceipt({transactionID}: PerDiemEReceiptProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {getCurrencySymbol} = useCurrencyList();
    const icons = useMemoizedLazyExpensifyIcons(['ExpensifyWordmark']);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`, {
        canBeMissing: true,
    });

    // Get receipt colorway, or default to Yellow.
    const {backgroundColor: primaryColor, color: secondaryColor} = StyleUtils.getEReceiptColorStyles(StyleUtils.getEReceiptColorCode(transaction)) ?? {};

    const {amount: transactionAmount, currency: transactionCurrency, merchant: transactionMerchant} = getTransactionDetails(transaction, CONST.DATE.MONTH_DAY_YEAR_FORMAT) ?? {};
    const ratesDescription = computeDefaultPerDiemExpenseRates(transaction?.comment?.customUnit ?? {}, transactionCurrency ?? '');
    const datesDescription = getPerDiemDates(transactionMerchant ?? '');
    const destination = getPerDiemDestination(transactionMerchant ?? '');
    const formattedAmount = convertToDisplayStringWithoutCurrency(transactionAmount ?? 0, transactionCurrency);
    const currency = getCurrencySymbol(transactionCurrency ?? '');

    const secondaryTextColorStyle = secondaryColor ? StyleUtils.getColorStyle(secondaryColor) : undefined;

    return (
        <View style={[styles.eReceiptContainer, primaryColor ? StyleUtils.getBackgroundColorStyle(primaryColor) : undefined]}>
            <View style={styles.fullScreen}>
                <EReceiptThumbnail
                    transactionID={transactionID}
                    centerIconV={false}
                />
            </View>
            <View style={[styles.alignItemsCenter, styles.ph8, styles.pb14, styles.pt8]}>
                <View style={[StyleUtils.getWidthAndHeightStyle(variables.eReceiptIconWidth, variables.eReceiptIconHeight)]} />
            </View>
            <View style={[styles.flexColumn, styles.justifyContentBetween, styles.alignItemsCenter, styles.ph9, styles.flex1]}>
                <View style={[styles.alignItemsCenter, styles.alignSelfCenter, styles.flexColumn, styles.gap2, styles.mb8]}>
                    <View style={[styles.flexRow, styles.justifyContentCenter, StyleUtils.getWidthStyle(variables.eReceiptTextContainerWidth)]}>
                        <View style={[styles.flexColumn, styles.pt1]}>
                            <Text style={[styles.eReceiptCurrency, secondaryTextColorStyle]}>{currency}</Text>
                        </View>
                        <Text
                            adjustsFontSizeToFit
                            style={[styles.eReceiptAmountLarge, secondaryTextColorStyle]}
                        >
                            {formattedAmount}
                        </Text>
                    </View>
                    <Text style={[styles.eReceiptMerchant, styles.breakWord, styles.textAlignCenter]}>{`${destination} ${translate('common.perDiem').toLowerCase()}`}</Text>
                </View>
                <View style={[styles.alignSelfStretch, styles.flexColumn, styles.mb8, styles.gap4]}>
                    <View style={[styles.flexColumn, styles.gap1]}>
                        <Text style={[styles.eReceiptWaypointTitle, secondaryTextColorStyle]}>{translate('iou.dates')}</Text>
                        <Text style={[styles.eReceiptWaypointAddress]}>{datesDescription}</Text>
                    </View>
                    <View style={[styles.flexColumn, styles.gap1]}>
                        <Text style={[styles.eReceiptWaypointTitle, secondaryTextColorStyle]}>{translate('iou.rates')}</Text>
                        <Text style={[styles.eReceiptWaypointAddress]}>{ratesDescription}</Text>
                    </View>
                </View>
                <View style={[styles.justifyContentBetween, styles.alignItemsCenter, styles.alignSelfStretch, styles.flexRow, styles.mb8]}>
                    <Icon
                        width={variables.eReceiptWordmarkWidth}
                        height={variables.eReceiptWordmarkHeight}
                        fill={secondaryColor}
                        src={icons.ExpensifyWordmark}
                    />
                    <Text style={styles.eReceiptGuaranteed}>{translate('eReceipt.guaranteed')}</Text>
                </View>
            </View>
        </View>
    );
}

export default PerDiemEReceipt;
