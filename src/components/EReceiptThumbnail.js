import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import * as ReportUtils from '@libs/ReportUtils';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Icon from './Icon';
import * as eReceiptBGs from './Icon/EReceiptBGs';
import * as Expensicons from './Icon/Expensicons';
import * as MCCIcons from './Icon/MCCIcons';
import Image from './Image';
import transactionPropTypes from './transactionPropTypes';

const propTypes = {
    /* TransactionID of the transaction this EReceipt corresponds to */
    // eslint-disable-next-line react/no-unused-prop-types
    transactionID: PropTypes.string.isRequired,

    /* Onyx Props */
    transaction: transactionPropTypes,
};

const defaultProps = {
    transaction: {},
};

const backgroundImages = {
    [CONST.ERECEIPT_COLORS.YELLOW]: eReceiptBGs.EReceiptBG_Yellow,
    [CONST.ERECEIPT_COLORS.ICE]: eReceiptBGs.EReceiptBG_Ice,
    [CONST.ERECEIPT_COLORS.BLUE]: eReceiptBGs.EReceiptBG_Blue,
    [CONST.ERECEIPT_COLORS.GREEN]: eReceiptBGs.EReceiptBG_Green,
    [CONST.ERECEIPT_COLORS.TANGERINE]: eReceiptBGs.EReceiptBG_Tangerine,
    [CONST.ERECEIPT_COLORS.PINK]: eReceiptBGs.EReceiptBG_Pink,
};

function getBackgroundImage(transaction) {
    return backgroundImages[StyleUtils.getEReceiptColorCode(transaction)];
}

function EReceiptThumbnail({transaction}) {
    const styles = useThemeStyles();
    // Get receipt colorway, or default to Yellow.
    const {backgroundColor: primaryColor, color: secondaryColor} = StyleUtils.getEReceiptColorStyles(StyleUtils.getEReceiptColorCode(transaction));

    const [containerWidth, setContainerWidth] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    const onContainerLayout = (event) => {
        const {width, height} = event.nativeEvent.layout;
        setContainerWidth(width);
        setContainerHeight(height);
    };

    const {mccGroup: transactionMCCGroup} = ReportUtils.getTransactionDetails(transaction);
    const MCCIcon = MCCIcons[`${transactionMCCGroup}`];

    const isSmall = containerWidth && containerWidth < variables.eReceiptThumbnailSmallBreakpoint;
    const isMedium = containerWidth && containerWidth < variables.eReceiptThumbnailMediumBreakpoint;

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
            style={[
                styles.flex1,
                StyleUtils.getBackgroundColorStyle(primaryColor),
                styles.overflowHidden,
                styles.alignItemsCenter,
                containerHeight && containerHeight < variables.eReceiptThumnailCenterReceiptBreakpoint ? styles.justifyContentCenter : {},
            ]}
            onLayout={onContainerLayout}
        >
            <Image
                source={getBackgroundImage(transaction)}
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
