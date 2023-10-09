import React, {useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import ONYXKEYS from '../ONYXKEYS';
import * as StyleUtils from '../styles/StyleUtils';
import transactionPropTypes from './transactionPropTypes';
import styles from '../styles/styles';
import * as Expensicons from './Icon/Expensicons';
import * as MCCIcons from './Icon/MCCIcons';
import Icon from './Icon';
import * as ReportUtils from '../libs/ReportUtils';
import variables from '../styles/variables';
import * as eReceiptBGs from './Icon/EReceiptBGs';
import Image from './Image';
import CONST from '../CONST';

const propTypes = {
    /* transactionID */
    transactionID: PropTypes.string.isRequired,

    /* Onyx Props */
    transaction: transactionPropTypes,
};

const defaultProps = {
    transaction: {},
};

function EReceiptThumbnail({transaction, transactionID}) {
    // Get receipt colorway, or default to Yellow.
    const colorCode = StyleUtils.getEReceiptColorCode(transaction.parentTransactionID || transaction.transactionID || transactionID) || CONST.ERECEIPT_COLORS.YELLOW;
    const colorStyles = StyleUtils.getEReceiptColorStyles(colorCode);
    const primaryColor = colorStyles.backgroundColor;
    const secondaryColor = colorStyles.color;

    const [containerWidth, setContainerWidth] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    const onContainerLayout = (event) => {
        const {width, height} = event.nativeEvent.layout;
        setContainerWidth(width);
        setContainerHeight(height);
    };

    const {mccGroup: transactionMCCGroup} = ReportUtils.getTransactionDetails(transaction);
    const MCCIcon = MCCIcons[`${transactionMCCGroup}`];

    const isSmall = containerWidth < variables.eReceiptThumbnailSmallBreakpoint;
    const isMedium = containerWidth < variables.eReceiptThumbnailMediumBreakpoint;

    let receiptIconWidth = variables.eReceiptIconWidth;
    let receiptIconHeight = variables.eReceiptIconHeight;
    let receiptMCCSize = variables.eReceiptMCCHeightWidth;

    if (isSmall) {
        receiptIconWidth = variables.eReceiptIconWidthSmall;
        receiptIconHeight = variables.eReceiptIconHeightSmall;
        receiptMCCSize = variables.eReceiptMCCHeightWidthSmall;
    } else if (isMedium) {
        receiptIconWidth = variables.eReceiptIconWidthMedium;
        receiptIconHeight = variables.eReceiptIconHeightMedium;
        receiptMCCSize = variables.eReceiptMCCHeightWidthMedium;
    }

    return (
        <View
            style={[styles.flex1, StyleUtils.getBackgroundColorStyle(primaryColor), styles.overflowHidden, styles.alignItemsCenter, containerHeight < 200 && styles.justifyContentCenter]}
            onLayout={onContainerLayout}
        >
            <Image 
                source={eReceiptBGs[`EReceiptBG_${colorCode}`]}
                style={styles.eReceiptBackgroundThumbnail}
                resizeMode="cover"
            />
            <View style={[styles.alignItemsCenter, styles.ph8, styles.pt8, styles.pb8]}>
                <View style={[StyleUtils.getWidthAndHeightStyle(receiptIconWidth, receiptIconHeight), styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <Icon
                        src={Expensicons.EReceiptIcon}
                        height={receiptIconHeight}
                        width={receiptIconWidth}
                        fill={secondaryColor}
                        additionalStyles={[styles.fullScreen]}
                    />
                    {MCCIcon ? (
                        <Icon
                            src={MCCIcon}
                            height={receiptMCCSize}
                            width={receiptMCCSize}
                            fill={primaryColor}
                        />
                    ) : null}
                </View>
            </View>
        </View>
    );
}

EReceiptThumbnail.displayName = 'EReceiptThumbnail';
EReceiptThumbnail.propTypes = propTypes;
EReceiptThumbnail.defaultProps = defaultProps;

export default withOnyx({
    transaction: {
        key: ({transactionID}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
    },
})(EReceiptThumbnail);
