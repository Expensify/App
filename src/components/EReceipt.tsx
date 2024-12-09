import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import EReceiptThumbnail from './EReceiptThumbnail';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';

type EReceiptOnyxProps = {
    transaction: OnyxEntry<Transaction>;
};

type EReceiptProps = EReceiptOnyxProps & {
    /* TransactionID of the transaction this EReceipt corresponds to */
    transactionID: string;
};

function EReceipt({transaction, transactionID}: EReceiptProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    // Get receipt colorway, or default to Yellow.
    const {backgroundColor: primaryColor, color: secondaryColor} = StyleUtils.getEReceiptColorStyles(StyleUtils.getEReceiptColorCode(transaction)) ?? {};

    const {
        amount: transactionAmount,
        currency: transactionCurrency,
        merchant: transactionMerchant,
        created: transactionDate,
        cardID: transactionCardID,
    } = ReportUtils.getTransactionDetails(transaction, CONST.DATE.MONTH_DAY_YEAR_FORMAT) ?? {};
    const formattedAmount = CurrencyUtils.convertToDisplayString(transactionAmount, transactionCurrency);
    const currency = CurrencyUtils.getCurrencySymbol(transactionCurrency ?? '');
    const amount = currency ? formattedAmount.replace(currency, '') : formattedAmount;
    const cardDescription = TransactionUtils.getCardName(transaction) ?? (transactionCardID ? CardUtils.getCardDescription(transactionCardID) : '');

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
                            {amount}
                        </Text>
                    </View>
                    <Text style={[styles.eReceiptMerchant, styles.breakWord, styles.textAlignCenter]}>{transactionMerchant}</Text>
                </View>
                <View style={[styles.alignSelfStretch, styles.flexColumn, styles.mb8, styles.gap4]}>
                    <View style={[styles.flexColumn, styles.gap1]}>
                        <Text style={[styles.eReceiptWaypointTitle, secondaryTextColorStyle]}>{translate('eReceipt.transactionDate')}</Text>
                        <Text style={[styles.eReceiptWaypointAddress]}>{transactionDate}</Text>
                    </View>
                    <View style={[styles.flexColumn, styles.gap1]}>
                        <Text style={[styles.eReceiptWaypointTitle, secondaryTextColorStyle]}>{translate('common.card')}</Text>
                        <Text style={[styles.eReceiptWaypointAddress]}>{cardDescription}</Text>
                    </View>
                </View>
                <View style={[styles.justifyContentBetween, styles.alignItemsCenter, styles.alignSelfStretch, styles.flexRow, styles.mb8]}>
                    <Icon
                        width={variables.eReceiptWordmarkWidth}
                        height={variables.eReceiptWordmarkHeight}
                        fill={secondaryColor}
                        src={Expensicons.ExpensifyWordmark}
                    />
                    <Text style={styles.eReceiptGuaranteed}>{translate('eReceipt.guaranteed')}</Text>
                </View>
            </View>
        </View>
    );
}

EReceipt.displayName = 'EReceipt';

export default withOnyx<EReceiptProps, EReceiptOnyxProps>({
    transaction: {
        key: ({transactionID}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
    },
})(EReceipt);
export type {EReceiptProps, EReceiptOnyxProps};
