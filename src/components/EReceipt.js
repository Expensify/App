import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import ONYXKEYS from '../ONYXKEYS';
import * as StyleUtils from '../styles/StyleUtils';
import transactionPropTypes from './transactionPropTypes';
import styles from '../styles/styles';
import * as Expensicons from './Icon/Expensicons';
import Icon from './Icon';
import Text from './Text';
import * as ReportUtils from '../libs/ReportUtils';
import * as CurrencyUtils from '../libs/CurrencyUtils';
import * as CardUtils from '../libs/CardUtils';
import variables from '../styles/variables';
import useLocalize from '../hooks/useLocalize';
import EReceiptThumbnail from './EReceiptThumbnail';
import CONST from '../CONST';

const propTypes = {
    /* TransactionID of the transaction this EReceipt corresponds to */
    transactionID: PropTypes.string.isRequired,

    /* Onyx Props */
    transaction: transactionPropTypes,
};

const defaultProps = {
    transaction: {},
};

function EReceipt({transaction, transactionID}) {
    const {translate} = useLocalize();

    // Get receipt colorway, or default to Yellow.
    const {backgroundColor: primaryColor, color: secondaryColor} = StyleUtils.getEReceiptColorStyles(StyleUtils.getEReceiptColorCode(transaction));

    const {
        amount: transactionAmount,
        currency: transactionCurrency,
        merchant: transactionMerchant,
        created: transactionDate,
        cardID: transactionCardID,
    } = ReportUtils.getTransactionDetails(transaction, CONST.DATE.MONTH_DAY_YEAR_FORMAT);
    const formattedAmount = CurrencyUtils.convertToDisplayString(transactionAmount, transactionCurrency);
    const currency = CurrencyUtils.getCurrencySymbol(transactionCurrency);
    const amount = formattedAmount.replace(currency, '');
    const cardDescription = CardUtils.getCardDescription(transactionCardID);

    const secondaryTextColorStyle = StyleUtils.getColorStyle(secondaryColor);

    return (
        <View style={[styles.eReceiptContainer, StyleUtils.getBackgroundColorStyle(primaryColor)]}>
            <View style={styles.fullScreen}>
                <EReceiptThumbnail transactionID={transactionID} />
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
EReceipt.propTypes = propTypes;
EReceipt.defaultProps = defaultProps;

export default withOnyx({
    transaction: {
        key: ({transactionID}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
    },
})(EReceipt);
