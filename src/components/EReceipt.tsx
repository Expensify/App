import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useEReceipt from '@hooks/useEReceipt';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCardDescription} from '@libs/CardUtils';
import {convertToDisplayString, getCurrencySymbol} from '@libs/CurrencyUtils';
import {getTransactionDetails} from '@libs/ReportUtils';
import {getCardName} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import ImageSVG from './ImageSVG';
import type {TransactionListItemType} from './SelectionList/types';
import Text from './Text';

type EReceiptProps = {
    /* TransactionID of the transaction this EReceipt corresponds to */
    transactionID: string | undefined;

    /** The transaction data in search */
    transactionItem?: TransactionListItemType;

    /** Where it is the preview */
    isThumbnail?: boolean;
};

const receiptMCCSize: number = variables.eReceiptMCCHeightWidthMedium;
const backgroundImageMinWidth: number = variables.eReceiptBackgroundImageMinWidth;
function EReceipt({transactionID, transactionItem, isThumbnail = false}: EReceiptProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const theme = useTheme();

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);

    const {primaryColor, secondaryColor, titleColor, MCCIcon, tripIcon, backgroundImage} = useEReceipt(transactionItem ?? transaction);

    const {
        amount: transactionAmount,
        currency: transactionCurrency,
        merchant: transactionMerchant,
        created: transactionDate,
        cardID: transactionCardID,
    } = getTransactionDetails(transactionItem ?? transaction, CONST.DATE.MONTH_DAY_YEAR_FORMAT) ?? {};
    const formattedAmount = convertToDisplayString(transactionAmount, transactionCurrency);
    const currency = getCurrencySymbol(transactionCurrency ?? '');
    const amount = currency ? formattedAmount.replace(currency, '') : formattedAmount;
    const cardDescription = getCardName(transaction) ?? (transactionCardID ? getCardDescription(transactionCardID) : '');

    const secondaryBgcolorStyle = secondaryColor ? StyleUtils.getBackgroundColorStyle(secondaryColor) : undefined;
    const primaryTextColorStyle = primaryColor ? StyleUtils.getColorStyle(primaryColor) : undefined;
    const titleTextColorStyle = titleColor ? StyleUtils.getColorStyle(titleColor) : undefined;

    return (
        <View
            style={[
                styles.eReceiptContainer,
                primaryColor ? StyleUtils.getBackgroundColorStyle(primaryColor) : undefined,
                isThumbnail && StyleUtils.getMinimumWidth(variables.eReceiptBGHWidth),
            ]}
        >
            <View style={[styles.flex1, primaryColor ? StyleUtils.getBackgroundColorStyle(primaryColor) : {}, styles.overflowHidden, styles.alignItemsCenter, styles.justifyContentCenter]}>
                <View style={[styles.eReceiptBackgroundThumbnail, StyleUtils.getMinimumWidth(backgroundImageMinWidth)]}>
                    <ImageSVG src={backgroundImage} />
                </View>
                <View style={styles.eReceiptContentContainer}>
                    <View>
                        <ImageSVG
                            src={Expensicons.ReceiptBody}
                            fill={theme.textColorfulBackground}
                            contentFit="fill"
                        />
                        <View style={styles.eReceiptContentWrapper}>
                            <View style={[StyleUtils.getBackgroundColorStyle(theme.textColorfulBackground), styles.alignItemsCenter, styles.justifyContentCenter, styles.h100]}>
                                <View
                                    style={[
                                        StyleUtils.getWidthAndHeightStyle(variables.eReceiptEmptyIconWidth, variables.eReceiptEmptyIconWidth),
                                        styles.alignItemsCenter,
                                        styles.justifyContentCenter,
                                        styles.borderRadiusComponentNormal,
                                        secondaryBgcolorStyle,
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
                                    <View style={[StyleUtils.getWidthAndHeightStyle(variables.eReceiptIconWidth, variables.h40)]} />
                                </View>
                                <View style={[styles.flexColumn, styles.justifyContentBetween, styles.alignItemsCenter, styles.ph9, styles.flex1]}>
                                    <View style={[styles.alignItemsCenter, styles.alignSelfCenter, styles.flexColumn, styles.gap2]}>
                                        <View style={[styles.flexRow, styles.justifyContentCenter, StyleUtils.getWidthStyle(variables.eReceiptTextContainerWidth)]}>
                                            <View style={[styles.flexColumn, styles.pt1]}>
                                                <Text style={[styles.eReceiptCurrency, primaryTextColorStyle]}>{currency}</Text>
                                            </View>
                                            <Text
                                                adjustsFontSizeToFit
                                                style={[styles.eReceiptAmountLarge, primaryTextColorStyle, styles.pr4]}
                                            >
                                                {amount}
                                            </Text>
                                        </View>
                                        <Text style={[styles.eReceiptMerchant, styles.breakWord, styles.textAlignCenter, primaryTextColorStyle]}>{transactionMerchant}</Text>
                                    </View>
                                    <View style={[styles.alignSelfStretch, styles.flexColumn, styles.gap4, styles.ph3]}>
                                        <View style={[styles.flexColumn, styles.gap1]}>
                                            <Text style={[styles.eReceiptWaypointTitle, titleTextColorStyle]}>{translate('eReceipt.transactionDate')}</Text>
                                            <Text style={[styles.eReceiptWaypointAddress, primaryTextColorStyle]}>{transactionDate}</Text>
                                        </View>
                                        <View style={[styles.flexColumn, styles.gap1]}>
                                            <Text style={[styles.eReceiptWaypointTitle, titleTextColorStyle]}>{translate('common.card')}</Text>
                                            <Text style={[styles.eReceiptWaypointAddress, primaryTextColorStyle]}>{cardDescription}</Text>
                                        </View>
                                    </View>
                                    <View>
                                        <View style={[styles.alignItemsCenter, styles.alignSelfStretch, styles.flexRow, styles.w100, styles.mb8]}>
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
        </View>
    );
}

EReceipt.displayName = 'EReceipt';

export default EReceipt;
export type {EReceiptProps};
