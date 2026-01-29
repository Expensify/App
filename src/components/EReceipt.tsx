import {filterPersonalCards} from '@selectors/Card';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import useCurrencyList from '@hooks/useCurrencyList';
import useEReceipt from '@hooks/useEReceipt';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCardDescription, getCompanyCardDescription} from '@libs/CardUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getTransactionDetails} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Transaction from '@src/types/onyx/Transaction';
import Icon from './Icon';
import ImageSVG from './ImageSVG';
import type {TransactionListItemType} from './SelectionListWithSections/types';
import Text from './Text';

type EReceiptProps = {
    /* TransactionID of the transaction this EReceipt corresponds to */
    transactionID: string | undefined;

    /** The transaction data in search */
    transactionItem?: TransactionListItemType | Transaction;

    /** Where it is the preview */
    isThumbnail?: boolean;

    /** Callback to be called when the image loads */
    onLoad?: () => void;
};

const receiptMCCSize: number = variables.eReceiptMCCHeightWidthMedium;
const backgroundImageMinWidth: number = variables.eReceiptBackgroundImageMinWidth;
function EReceipt({transactionID, transactionItem, onLoad, isThumbnail = false}: EReceiptProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {getCurrencySymbol} = useCurrencyList();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['ReceiptBody', 'ExpensifyWordmark']);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST, {selector: filterPersonalCards, canBeMissing: true});
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`, {canBeMissing: true});

    const {primaryColor, secondaryColor, titleColor, MCCIcon, tripIcon, backgroundImage} = useEReceipt(transactionItem ?? transaction);

    const isLoadedRef = useRef(false);

    const {
        amount: transactionAmount,
        currency: transactionCurrency,
        merchant: transactionMerchant,
        created: transactionDate,
        cardID: transactionCardID,
        cardName: transactionCardName,
    } = getTransactionDetails(transactionItem ?? transaction, CONST.DATE.MONTH_DAY_YEAR_FORMAT) ?? {};
    const formattedAmount = convertToDisplayString(transactionAmount, transactionCurrency);
    const currency = getCurrencySymbol(transactionCurrency ?? '');
    const amount = currency ? formattedAmount.replace(currency, '') : formattedAmount;
    const cardDescription =
        getCompanyCardDescription(transactionCardName, transactionCardID, cardList) ?? (transactionCardID ? getCardDescription(cardList?.[transactionCardID], translate) : '');
    const secondaryBgcolorStyle = secondaryColor ? StyleUtils.getBackgroundColorStyle(secondaryColor) : undefined;
    const primaryTextColorStyle = primaryColor ? StyleUtils.getColorStyle(primaryColor) : undefined;
    const titleTextColorStyle = titleColor ? StyleUtils.getColorStyle(titleColor) : undefined;

    useEffect(() => {
        if (isLoadedRef.current) {
            return;
        }
        isLoadedRef.current = true;
        onLoad?.();
    }, [onLoad]);

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
                    <ImageSVG
                        src={backgroundImage}
                        // Temporary solution only, since other cache policies are causing memory leaks on iOS
                        cachePolicy="none"
                    />
                </View>
                <View style={styles.eReceiptContentContainer}>
                    <View>
                        <ImageSVG
                            src={icons.ReceiptBody}
                            fill={theme.textColorfulBackground}
                            contentFit="fill"
                            // Temporary solution only, since other cache policies are causing memory leaks on iOS
                            cachePolicy="none"
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
                                                // Temporary solution only, since other cache policies are causing memory leaks on iOS
                                                cachePolicy="none"
                                            />
                                        ) : null}
                                        {!MCCIcon && tripIcon ? (
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
                                                src={icons.ExpensifyWordmark}
                                                // Temporary solution only, since other cache policies are causing memory leaks on iOS
                                                cachePolicy="none"
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

export default EReceipt;
export type {EReceiptProps};
