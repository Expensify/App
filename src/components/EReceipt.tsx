import React, { useMemo } from 'react';
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
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';
import Image from './Image';
import { getTripEReceiptIcon } from '@libs/TripReservationUtils';
import * as eReceiptBGs from './Icon/EReceiptBGs';
import * as MCCIcons from './Icon/MCCIcons';
import ImageSVG from './ImageSVG';
import useTheme from '@hooks/useTheme';


type EReceiptOnyxProps = {
    transaction: OnyxEntry<Transaction>;
};

type EReceiptProps = EReceiptOnyxProps & {
    /* TransactionID of the transaction this EReceipt corresponds to */
    transactionID: string;

    isThumbnail?: boolean;
};

const backgroundImages = {
    [CONST.ERECEIPT_COLORS.YELLOW]: eReceiptBGs.EReceiptBG_Yellow,
    [CONST.ERECEIPT_COLORS.ICE]: eReceiptBGs.EReceiptBG_Ice,
    [CONST.ERECEIPT_COLORS.BLUE]: eReceiptBGs.EReceiptBG_Blue,
    [CONST.ERECEIPT_COLORS.GREEN]: eReceiptBGs.EReceiptBG_Green,
    [CONST.ERECEIPT_COLORS.TANGERINE]: eReceiptBGs.EReceiptBG_Tangerine,
    [CONST.ERECEIPT_COLORS.PINK]: eReceiptBGs.EReceiptBG_Pink,
};
function EReceipt({transaction, transactionID, isThumbnail = false}: EReceiptProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const theme = useTheme();

    const colorCode = StyleUtils.getEReceiptColorCode(transaction);
    const colorStyles = StyleUtils.getEReceiptColorStyles(colorCode);
    const primaryColor = colorStyles?.backgroundColor;
    const secondaryColor = colorStyles?.color;
    const transactionDetails = ReportUtils.getTransactionDetails(transaction);
    const transactionMCCGroup = transactionDetails?.mccGroup;
    const MCCIcon = transactionMCCGroup ? MCCIcons[`${transactionMCCGroup}`] : MCCIcons['Airlines'];
    const tripIcon = getTripEReceiptIcon(transaction);

    const backgroundImage = useMemo(() => backgroundImages[colorCode], [colorCode]);

    let receiptIconWidth: number = variables.eReceiptIconWidth;
    let receiptIconHeight: number = variables.eReceiptIconHeight;
    let receiptMCCSize: number = variables.eReceiptMCCHeightWidth;
    let labelFontSize: number = variables.fontSizeNormal;
    let labelLineHeight: number = variables.lineHeightLarge;
    let backgroundImageMinWidth: number = variables.eReceiptBackgroundImageMinWidth;


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
    const primaryTextColorStyle = primaryColor ? StyleUtils.getColorStyle(primaryColor) : undefined;

    return (
        <View style={[styles.eReceiptContainer, primaryColor ? StyleUtils.getBackgroundColorStyle(primaryColor) : undefined]}>
            <View style={[styles.flex1, primaryColor ? StyleUtils.getBackgroundColorStyle(primaryColor) : {}, styles.overflowHidden, styles.alignItemsCenter]}>
                <Image
                    source={backgroundImage}
                    style={[styles.eReceiptBackgroundThumbnail, StyleUtils.getMinimumWidth(backgroundImageMinWidth)]}
                    resizeMode="cover"
                />
                <View style={[styles.p4, styles.w100]}>
                    <View>
                        <ImageSVG
                            src={Expensicons.Incors}
                            width={"100%"}
                            fill={theme.white}
                        />
                    </View>
                    <View style={[StyleUtils.getBackgroundColorStyle(theme.white), styles.alignItemsCenter, styles.justifyContentCenter]}>
                        <View
                            style={[
                                StyleUtils.getWidthAndHeightStyle(72, 72),
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
                                <View style={[styles.alignItemsCenter, styles.alignSelfStretch, styles.flexRow, styles.mb8, styles.w100]}>
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
                    <View>
                        <ImageSVG
                            src={Expensicons.Incors2}
                            width={"100%"}
                            fill={theme.white}
                        />
                    </View>
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
