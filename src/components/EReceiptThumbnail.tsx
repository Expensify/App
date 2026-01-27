import React from 'react';
import {View} from 'react-native';
import useEReceipt from '@hooks/useEReceipt';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isPerDiemRequest as isPerDiemRequestTransactionUtils} from '@libs/TransactionUtils';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import Icon from './Icon';
import ImageSVG from './ImageSVG';
import Text from './Text';

type IconSize = 'x-small' | 'small' | 'medium' | 'large';

type EReceiptThumbnailProps = {
    /** TransactionID of the transaction this EReceipt corresponds to. */
    transactionID: string | undefined;

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

function EReceiptThumbnail({transactionID, borderRadius, fileExtension, isReceiptThumbnail = false, centerIconV = true, iconSize = 'large'}: EReceiptThumbnailProps) {
    const icons = useMemoizedLazyExpensifyIcons(['CalendarSolid', 'EReceiptIcon']);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`, {
        canBeMissing: true,
    });

    const {primaryColor, secondaryColor, MCCIcon, tripIcon, backgroundImage} = useEReceipt(transaction, fileExtension, isReceiptThumbnail);
    const isPerDiemRequest = isPerDiemRequestTransactionUtils(transaction);

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
            <View style={[styles.eReceiptBackgroundThumbnail, StyleUtils.getMinimumWidth(backgroundImageMinWidth)]}>
                <ImageSVG
                    src={backgroundImage}
                    // Temporary solution only, since other cache policies are causing memory leaks on iOS
                    cachePolicy="none"
                />
            </View>
            <View style={[styles.alignItemsCenter, styles.ph8, styles.pt8, styles.pb8]}>
                <View style={[StyleUtils.getWidthAndHeightStyle(receiptIconWidth, receiptIconHeight), styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <Icon
                        src={icons.EReceiptIcon}
                        height={receiptIconHeight}
                        width={receiptIconWidth}
                        fill={secondaryColor}
                        additionalStyles={[styles.fullScreen]}
                        // Temporary solution only, since other cache policies are causing memory leaks on iOS
                        cachePolicy="none"
                    />
                    {isReceiptThumbnail && !!fileExtension && (
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
                    {isPerDiemRequest ? (
                        <Icon
                            src={icons.CalendarSolid}
                            height={receiptMCCSize}
                            width={receiptMCCSize}
                            fill={primaryColor}
                            // Temporary solution only, since other cache policies are causing memory leaks on iOS
                            cachePolicy="none"
                        />
                    ) : null}
                    {!isPerDiemRequest && MCCIcon && !isReceiptThumbnail ? (
                        <Icon
                            src={MCCIcon}
                            height={receiptMCCSize}
                            width={receiptMCCSize}
                            fill={primaryColor}
                            // Temporary solution only, since other cache policies are causing memory leaks on iOS
                            cachePolicy="none"
                        />
                    ) : null}
                    {!isPerDiemRequest && !MCCIcon && tripIcon ? (
                        <Icon
                            src={tripIcon}
                            height={receiptMCCSize}
                            width={receiptMCCSize}
                            fill={primaryColor}
                            // Temporary solution only, since other cache policies are causing memory leaks on iOS
                            cachePolicy="none"
                        />
                    ) : null}
                </View>
            </View>
        </View>
    );
}

export default EReceiptThumbnail;

export type {IconSize, EReceiptThumbnailProps};
