import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportUtils from '@libs/ReportUtils';
import * as TripReservationUtils from '@libs/TripReservationUtils';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import Icon from './Icon';
import * as eReceiptBGs from './Icon/EReceiptBGs';
import * as Expensicons from './Icon/Expensicons';
import * as MCCIcons from './Icon/MCCIcons';
import Image from './Image';
import Text from './Text';

type EReceiptThumbnailOnyxProps = {
    transaction: OnyxEntry<Transaction>;
};

type IconSize = 'x-small' | 'small' | 'medium' | 'large';

type EReceiptThumbnailProps = EReceiptThumbnailOnyxProps & {
    /** TransactionID of the transaction this EReceipt corresponds to. It's used by withOnyx HOC */
    // eslint-disable-next-line react/no-unused-prop-types
    transactionID: string;

    /** Border radius to be applied on the parent view. */
    borderRadius?: number;

    /** The file extension of the receipt that the preview thumbnail is being displayed for. */
    fileExtension?: string;

    /** Whether it is a receipt thumbnail we are displaying. */
    isReceiptThumbnail?: boolean;

    /** Center the eReceipt Icon vertically */
    centerIconV?: boolean;

    /** Size of the eReceipt icon. Possible values 'x-small', 'small', 'medium' or 'large' */
    iconSize?: IconSize;
};

const backgroundImages = {
    [CONST.ERECEIPT_COLORS.YELLOW]: eReceiptBGs.EReceiptBG_Yellow,
    [CONST.ERECEIPT_COLORS.ICE]: eReceiptBGs.EReceiptBG_Ice,
    [CONST.ERECEIPT_COLORS.BLUE]: eReceiptBGs.EReceiptBG_Blue,
    [CONST.ERECEIPT_COLORS.GREEN]: eReceiptBGs.EReceiptBG_Green,
    [CONST.ERECEIPT_COLORS.TANGERINE]: eReceiptBGs.EReceiptBG_Tangerine,
    [CONST.ERECEIPT_COLORS.PINK]: eReceiptBGs.EReceiptBG_Pink,
};

function EReceiptThumbnail({transaction, borderRadius, fileExtension, isReceiptThumbnail = false, centerIconV = true, iconSize = 'large'}: EReceiptThumbnailProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const colorCode = isReceiptThumbnail ? StyleUtils.getFileExtensionColorCode(fileExtension) : StyleUtils.getEReceiptColorCode(transaction);

    const backgroundImage = useMemo(() => backgroundImages[colorCode], [colorCode]);

    const colorStyles = StyleUtils.getEReceiptColorStyles(colorCode);
    const primaryColor = colorStyles?.backgroundColor;
    const secondaryColor = colorStyles?.color;
    const transactionDetails = ReportUtils.getTransactionDetails(transaction);
    const transactionMCCGroup = transactionDetails?.mccGroup;
    const MCCIcon = transactionMCCGroup ? MCCIcons[`${transactionMCCGroup}`] : undefined;
    const tripIcon = TripReservationUtils.getTripEReceiptIcon(transaction);

    let receiptIconWidth: number = variables.eReceiptIconWidth;
    let receiptIconHeight: number = variables.eReceiptIconHeight;
    let receiptMCCSize: number = variables.eReceiptMCCHeightWidth;
    let labelFontSize: number = variables.fontSizeNormal;
    let labelLineHeight: number = variables.lineHeightLarge;
    let backgroundImageMinWidth: number = variables.eReceiptBackgroundImageMinWidth;

    if (iconSize === 'x-small') {
        receiptIconWidth = variables.eReceiptIconWidthXSmall;
        receiptIconHeight = variables.eReceiptIconHeightXSmall;
        receiptMCCSize = variables.iconSizeXSmall;
        labelFontSize = variables.fontSizeExtraSmall;
        labelLineHeight = variables.lineHeightXSmall;
        backgroundImageMinWidth = variables.w80;
    } else if (iconSize === 'small') {
        receiptIconWidth = variables.eReceiptIconWidthSmall;
        receiptIconHeight = variables.eReceiptIconHeightSmall;
        receiptMCCSize = variables.eReceiptMCCHeightWidthSmall;
        labelFontSize = variables.fontSizeExtraSmall;
        labelLineHeight = variables.lineHeightXSmall;
    } else if (iconSize === 'medium') {
        receiptIconWidth = variables.eReceiptIconWidthMedium;
        receiptIconHeight = variables.eReceiptIconHeightMedium;
        receiptMCCSize = variables.eReceiptMCCHeightWidthMedium;
        labelFontSize = variables.fontSizeLabel;
        labelLineHeight = variables.lineHeightNormal;
    }

    return (
        <View
            style={[
                styles.flex1,
                primaryColor ? StyleUtils.getBackgroundColorStyle(primaryColor) : {},
                styles.overflowHidden,
                styles.alignItemsCenter,
                centerIconV ? styles.justifyContentCenter : {},
                borderRadius ? {borderRadius} : {},
            ]}
        >
            <Image
                source={backgroundImage}
                style={[styles.eReceiptBackgroundThumbnail, StyleUtils.getMinimumWidth(backgroundImageMinWidth)]}
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
                    {isReceiptThumbnail && fileExtension && (
                        <Text
                            selectable={false}
                            style={[
                                styles.labelStrong,
                                StyleUtils.getFontSizeStyle(labelFontSize),
                                StyleUtils.getLineHeightStyle(labelLineHeight),
                                StyleUtils.getTextColorStyle(primaryColor ?? colors.black),
                            ]}
                        >
                            {fileExtension.toUpperCase()}
                        </Text>
                    )}
                    {MCCIcon && !isReceiptThumbnail ? (
                        <Icon
                            src={MCCIcon}
                            height={receiptMCCSize}
                            width={receiptMCCSize}
                            fill={primaryColor}
                        />
                    ) : null}
                    {!MCCIcon && tripIcon ? (
                        <Icon
                            src={tripIcon}
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
export default withOnyx<EReceiptThumbnailProps, EReceiptThumbnailOnyxProps>({
    transaction: {
        key: ({transactionID}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
    },
})(EReceiptThumbnail);
export type {IconSize, EReceiptThumbnailProps, EReceiptThumbnailOnyxProps};
