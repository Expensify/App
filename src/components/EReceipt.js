import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import ONYXKEYS from '../ONYXKEYS';
import EReceiptBG from '../../assets/images/eReceipt-BGImage.svg';
import * as StyleUtils from '../styles/StyleUtils';
import transactionPropTypes from './transactionPropTypes';
import styles from '../styles/styles';
import * as Expensicons from './Icon/Expensicons';
import * as MCCIcons from './Icon/MCCIcons';
import Icon from './Icon';
import Text from './Text';
import * as ReportUtils from '../libs/ReportUtils';
import * as CurrencyUtils from '../libs/CurrencyUtils';
import * as CardUtils from '../libs/CardUtils';
import variables from '../styles/variables';

const propTypes = {
        /* Onyx Props */
        transactionID: PropTypes.string.isRequired,

        /* Onyx Props */
        transaction: transactionPropTypes,
};

const defaultProps = {
    transaction: {},
}

function EReceipt({transaction}) {
    const colorStyles = StyleUtils.getEReceiptColor(transaction.parentTransactionID || transaction.transactionID || '');
    const primaryColor = colorStyles.backgroundColor;
    const secondaryColor = colorStyles.color;

    const {amount: transactionAmount, currency: transactionCurrency, merchant: transactionMerchant, created: transactionDate, mccGroup: transactionMCCGroup, cardID: transactionCardID} = ReportUtils.getTransactionDetails(transaction);
    const formattedAmount = CurrencyUtils.convertToDisplayString(transactionAmount, transactionCurrency);
    const currency = CurrencyUtils.getCurrencySymbol(transactionCurrency);
    const amount = formattedAmount.replace(currency, '');

    const cardDescription = CardUtils.getCardDescription(transactionCardID);
    // eslint-disable-next-line no-console
    console.log('...', {formattedAmount, currency, amount, strip: formattedAmount.replace(currency, ''), cardDescription});
    
    return (
        <View style={[styles.eReceiptContainer, StyleUtils.getBackgroundColorStyle(primaryColor)]}>
                <View style={styles.eReceiptBackground}>
                    <EReceiptBG style={colorStyles} />
                </View>
                <View style={[styles.alignItemsCenter, styles.ph8, styles.pb14, styles.pt8]}>
                    <View style={[StyleUtils.getWidthAndHeightStyle(variables.eReceiptIconWidth, variables.eReceiptIconHeight), styles.alignItemsCenter, styles.justifyContentCenter]}>
                        <Icon
                            src={Expensicons.EReceiptIcon}
                            height={variables.eReceiptIconHeight}
                            width={variables.eReceiptIconWidth}
                            fill={secondaryColor}
                            additionalStyles={[styles.eReceiptBackground]}
                        />
                        <Icon
                            src={MCCIcons.Airlines}
                            height={variables.eReceiptMCCHeightWidth}
                            width={variables.eReceiptMCCHeightWidth}
                            fill={primaryColor}
                        />
                    </View>
                </View>
                <View style={[styles.flexColumn, styles.justifyContentBetween, styles.alignItemsCenter, styles.ph9, styles.flex1]}>
                <View style={[styles.alignItemsCenter, styles.alignSelfCenter, styles.flexColumn, styles.gap2, {marginBottom: 32}]}>
                        <View style={[styles.flexRow, styles.justifyContentCenter]}>
                            <View style={[styles.flexColumn, styles.pt1]}>
                                <Text style={[styles.eReceiptCurrency, StyleUtils.getColorStyle(secondaryColor)]}>
                                    $
                                </Text>
                            </View>
                            <Text adjustsFontSizeToFit style={[styles.eReceiptAmountLarge, StyleUtils.getColorStyle(secondaryColor)]}>
                            1,245.93
                            </Text>
                        </View>
                        <Text style={[styles.eReceiptMerchant, styles.breakAll, styles.textAlignCenter]}>
                            United
                        </Text>
                    </View>
                    <View style={[styles.alignSelfStretch, styles.flexColumn, styles.mb8, styles.gap4]}>
                        <View style={[styles.flexColumn, styles.gap1]}>
                            <Text style={[styles.eReceiptWaypointTitle, StyleUtils.getColorStyle(secondaryColor)]}>
                            Transaction date
                            </Text>
                            <Text style={[styles.eReceiptWaypointAddress]}>
                            January 12, 2022
                            </Text>
                        </View>
                        <View style={[styles.flexColumn, styles.gap1]}>
                            <Text style={[styles.eReceiptWaypointTitle, StyleUtils.getColorStyle(secondaryColor)]}>
                            Card
                            </Text>
                            <Text style={[styles.eReceiptWaypointAddress]}>
                            Expensify Card - 1234
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.justifyContentBetween, styles.alignItemsCenter, styles.alignSelfStretch, styles.flexRow, styles.mb8]}>
                        <Icon
                            width={variables.eReceiptWordmarkWidth}
                            height={variables.eReceiptWordmarkHeight}
                            fill={secondaryColor}
                            src={Expensicons.ExpensifyWordmark}
                        />
                        <Text style={styles.eReceiptGuaranteed}>Guaranteed eReceipt</Text>
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
