import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCardDescription} from '@libs/CardUtils';
import {convertToDisplayString, getCurrencySymbol} from '@libs/CurrencyUtils';
import {getTransactionDetails} from '@libs/ReportUtils';
import {getCardName} from '@libs/TransactionUtils';
import {getTripEReceiptIcon} from '@libs/TripReservationUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Icon from './Icon';
import * as eReceiptBGs from './Icon/EReceiptBGs';
import * as Expensicons from './Icon/Expensicons';
import * as MCCIcons from './Icon/MCCIcons';
import Image from './Image';
import ImageSVG from './ImageSVG';
import Text from './Text';

type EReceiptProps = {
    /* TransactionID of the transaction this EReceipt corresponds to */
    transactionID: string | undefined;
};

const backgroundImages = {
    [CONST.ERECEIPT_COLORS.YELLOW]: eReceiptBGs.EReceiptBG_Yellow,
    [CONST.ERECEIPT_COLORS.ICE]: eReceiptBGs.EReceiptBG_Ice,
    [CONST.ERECEIPT_COLORS.BLUE]: eReceiptBGs.EReceiptBG_Blue,
    [CONST.ERECEIPT_COLORS.GREEN]: eReceiptBGs.EReceiptBG_Green,
    [CONST.ERECEIPT_COLORS.TANGERINE]: eReceiptBGs.EReceiptBG_Tangerine,
    [CONST.ERECEIPT_COLORS.PINK]: eReceiptBGs.EReceiptBG_Pink,
};
function EReceipt({transactionID}: EReceiptProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const theme = useTheme();

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);

    const colorCode = StyleUtils.getEReceiptColorCode(transaction);
    const colorStyles = StyleUtils.getEReceiptColorStyles(colorCode);
    const primaryColor = colorStyles?.backgroundColor;
    const secondaryColor = colorStyles?.color;
    const transactionDetails = getTransactionDetails(transaction);
    const transactionMCCGroup = transactionDetails?.mccGroup;
    const MCCIcon = transactionMCCGroup ? MCCIcons[`${transactionMCCGroup}`] : undefined;
    const tripIcon = getTripEReceiptIcon(transaction);

    const backgroundImage = useMemo(() => backgroundImages[colorCode], [colorCode]);

    const receiptMCCSize: number = variables.eReceiptMCCHeightWidth;
    const backgroundImageMinWidth: number = variables.eReceiptBackgroundImageMinWidth;

    const {
        amount: transactionAmount,
        currency: transactionCurrency,
        merchant: transactionMerchant,
        created: transactionDate,
        cardID: transactionCardID,
    } = getTransactionDetails(transaction, CONST.DATE.MONTH_DAY_YEAR_FORMAT) ?? {};
    const formattedAmount = convertToDisplayString(transactionAmount, transactionCurrency);
    const currency = getCurrencySymbol(transactionCurrency ?? '');
    const amount = currency ? formattedAmount.replace(currency, '') : formattedAmount;
    const cardDescription = getCardName(transaction) ?? (transactionCardID ? getCardDescription(transactionCardID) : '');

    const secondaryTextColorStyle = secondaryColor ? StyleUtils.getColorStyle(secondaryColor) : undefined;
    const primaryTextColorStyle = primaryColor ? StyleUtils.getColorStyle(primaryColor) : undefined;

    return (
        <View style={[styles.eReceiptContainer, primaryColor ? StyleUtils.getBackgroundColorStyle(primaryColor) : undefined]}>
            <View style={[styles.flex1, primaryColor ? StyleUtils.getBackgroundColorStyle(primaryColor) : {}, styles.overflowHidden, styles.alignItemsCenter]}>
                <Image
                    source={backgroundImage}
                    style={[styles.eReceiptBackgroundThumbnail, StyleUtils.getMinimumWidth(backgroundImageMinWidth)]}
                    resizeMode="cover"
                />
                <View style={styles.eReceiptContentContainer}>
                    <View style={styles.eReceiptBody}>
                        <ImageSVG
                            src={Expensicons.ReceiptBody}
                            fill={theme.white}
                            height={515}
                        />
                    </View>
                    <View style={styles.eReceiptContentWrapper}>
                        <View style={[StyleUtils.getBackgroundColorStyle(theme.white), styles.alignItemsCenter, styles.justifyContentCenter, styles.pt3]}>
                            <View
                                style={[
                                    StyleUtils.getWidthAndHeightStyle(variables.eReceiptIconWidth, variables.eReceiptIconWidth),
                                    styles.alignItemsCenter,
                                    styles.justifyContentCenter,
                                    styles.borderRadiusComponentLarge,
                                    {backgroundColor: secondaryColor},
                                    styles.mb3,
                                ]}
                            >
                                <View>
                                    {MCCIcon ? (
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
                            <Text style={[styles.eReceiptGuaranteed, primaryTextColorStyle]}>{translate('eReceipt.guaranteed')}</Text>
                            <View style={[styles.alignItemsCenter]}>
                                <View style={[StyleUtils.getWidthAndHeightStyle(variables.eReceiptIconWidth, variables.eReceiptIconHeight)]} />
                            </View>
                            <View style={[styles.flexColumn, styles.justifyContentBetween, styles.alignItemsCenter, styles.ph9, styles.flex1]}>
                                <View style={[styles.alignItemsCenter, styles.alignSelfCenter, styles.flexColumn, styles.gap2, styles.mb8]}>
                                    <View style={[styles.flexRow, styles.justifyContentCenter, StyleUtils.getWidthStyle(variables.eReceiptTextContainerWidth)]}>
                                        <View style={[styles.flexColumn, styles.pt1]}>
                                            <Text style={[styles.eReceiptCurrency, primaryTextColorStyle]}>{currency}</Text>
                                        </View>
                                        <Text
                                            adjustsFontSizeToFit
                                            style={[styles.eReceiptAmountLarge, primaryTextColorStyle]}
                                        >
                                            {amount}
                                        </Text>
                                    </View>
                                    <Text style={[styles.eReceiptMerchant, styles.breakWord, styles.textAlignCenter, primaryTextColorStyle]}>{transactionMerchant}</Text>
                                </View>
                                <View style={[styles.alignSelfStretch, styles.flexColumn, styles.mb8, styles.gap4]}>
                                    <View style={[styles.flexColumn, styles.gap1]}>
                                        <Text style={[styles.eReceiptWaypointTitle, secondaryTextColorStyle]}>{translate('eReceipt.transactionDate')}</Text>
                                        <Text style={[styles.eReceiptWaypointAddress, primaryTextColorStyle]}>{transactionDate}</Text>
                                    </View>
                                    <View style={[styles.flexColumn, styles.gap1]}>
                                        <Text style={[styles.eReceiptWaypointTitle, secondaryTextColorStyle]}>{translate('common.card')}</Text>
                                        <Text style={[styles.eReceiptWaypointAddress, primaryTextColorStyle]}>{cardDescription}</Text>
                                    </View>
                                </View>
                                <View>
                                    <View style={[styles.alignItemsCenter, styles.alignSelfStretch, styles.flexRow, styles.w100]}>
                                        <Icon
                                            width={variables.eReceiptWordmarkWidth}
                                            height={variables.eReceiptWordmarkHeight}
                                            fill={secondaryColor}
                                            src={Expensicons.ExpensifyWordmark}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

EReceipt.displayName = 'EReceipt';

export default EReceipt;
export type {EReceiptProps};
