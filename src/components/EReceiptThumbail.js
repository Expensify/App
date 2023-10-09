import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import ONYXKEYS from '../ONYXKEYS';
import EReceiptBG from '../../assets/images/eReceipt-BGImage2.svg';
import * as StyleUtils from '../styles/StyleUtils';
import transactionPropTypes from './transactionPropTypes';
import styles from '../styles/styles';
import * as Expensicons from './Icon/Expensicons';
import * as MCCIcons from './Icon/MCCIcons';
import Icon from './Icon';
import * as ReportUtils from '../libs/ReportUtils';
import variables from '../styles/variables';

const propTypes = {
    /* transactionID */
    transactionID: PropTypes.string.isRequired,

    /* Onyx Props */
    transaction: transactionPropTypes,
};

const defaultProps = {
    transaction: {},
};

function EReceiptThumbail({transaction}) {
    const colorStyles = StyleUtils.getEReceiptColor(transaction.parentTransactionID || transaction.transactionID || '');
    const primaryColor = colorStyles.backgroundColor;
    const secondaryColor = colorStyles.color;

    const {
        mccGroup: transactionMCCGroup,
    } = ReportUtils.getTransactionDetails(transaction);
    const MCCIcon = MCCIcons[`${transactionMCCGroup}`];

    return (
        <View style={[styles.flex1, StyleUtils.getBackgroundColorStyle(primaryColor), styles.overflowHidden, styles.alignItemsCenter, styles.justifyContentCenter, StyleUtils.getMinimumHeight(variables.eReceiptIconHeight + 16), {minWidth: variables.eReceiptIconWidth + 16}]}>
            <View style={styles.eReceiptBackgroundThumbnail}>
                    <EReceiptBG style={{...colorStyles, width: '100%'}} />  
            </View>
            <View style={[styles.alignItemsCenter, styles.ph8, styles.pt8, styles.pb8]}>
                <View style={[StyleUtils.getWidthAndHeightStyle(variables.eReceiptIconWidth, variables.eReceiptIconHeight), styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <Icon
                        src={Expensicons.EReceiptIcon}
                        height={variables.eReceiptIconHeight}
                        width={variables.eReceiptIconWidth}
                        fill={secondaryColor}
                        additionalStyles={[styles.eReceiptBackground]}
                    />
                    {MCCIcon ? (
                        <Icon
                            src={MCCIcon}
                            height={variables.eReceiptMCCHeightWidth}
                            width={variables.eReceiptMCCHeightWidth}
                            fill={primaryColor}
                        />
                    ) : null}
                </View>
            </View>
        </View>
    );
}

EReceiptThumbail.displayName = 'EReceiptThumbail';
EReceiptThumbail.propTypes = propTypes;
EReceiptThumbail.defaultProps = defaultProps;

export default withOnyx({
    transaction: {
        key: ({transactionID}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
    },
})(EReceiptThumbail);
