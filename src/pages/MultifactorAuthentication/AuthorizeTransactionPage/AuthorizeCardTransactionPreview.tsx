import React from 'react';
import {View} from 'react-native';
import EReceiptWithSizeCalculation from '@components/EReceiptWithSizeCalculation';
import Icon from '@components/Icon';
import * as eReceiptBGs from '@components/Icon/EReceiptBGs';
import {CreditCardExclamation} from '@components/Icon/Expensicons';
import Text from '@components/Text';
import TransactionPreviewSkeletonView from '@components/TransactionPreviewSkeletonView';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayStringWithExplicitCurrency} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {formatLastFourPAN} from '@libs/TransactionPreviewUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type AuthorizeCardTransactionPreviewProps = {
    transactionID?: string;
    amount?: number;
    currency?: string;
    merchant?: string;
    created?: string;
    lastFourPAN?: string;
};

function AuthorizeCardTransactionPreview({transactionID, amount, currency, merchant, created, lastFourPAN}: AuthorizeCardTransactionPreviewProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['CreditCard', 'ReceiptBody']);

    const reportPreviewStyles = StyleUtils.getMoneyRequestReportPreviewStyle(shouldUseNarrowLayout, 1);
    const transactionPreviewWidth = reportPreviewStyles.transactionPreviewStandaloneStyle.width;
    const containerStyle = [styles.border, styles.moneyRequestPreviewBox, reportPreviewStyles.transactionPreviewStandaloneStyle];

    // Show skeleton when required transaction data is not yet available (e.g. initial load before parent has received it from Onyx).
    // Data is loaded by the parent; this component does not fetch.
    const shouldShowSkeleton = !created && !transactionID;
    if (shouldShowSkeleton) {
        return (
            <View style={containerStyle}>
                <TransactionPreviewSkeletonView transactionPreviewWidth={transactionPreviewWidth} />
            </View>
        );
    }

    const formattedDate = created
        ? DateUtils.formatWithUTCTimeZone(created, DateUtils.doesDateBelongToAPastYear(created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT)
        : '';
    const headerText = [formattedDate, translate('common.card')].filter(Boolean).join(` ${CONST.DOT_SEPARATOR} `);
    const displayAmount = amount === undefined ? '' : convertToDisplayStringWithExplicitCurrency(amount, currency);

    const formattedLastFourPAN = formatLastFourPAN(lastFourPAN);
    const shouldShowCardEnding = formattedLastFourPAN.length > 0;
    const cardEndingText = shouldShowCardEnding ? `${translate('paymentMethodList.accountLastFour')} ${formattedLastFourPAN}` : '';
    const shouldShowMerchantOrDescription = !!merchant;

    const colorStyles = StyleUtils.getEReceiptColorStyles(CONST.ERECEIPT_COLORS.GREEN);
    const receiptOverrideTheme = {
        primaryColor: colorStyles?.backgroundColor,
        secondaryColor: colorStyles?.color,
        titleColor: colorStyles?.titleColor,
        MCCIcon: CreditCardExclamation,
        backgroundImage: eReceiptBGs.EReceiptBG_Green,
        titleText: translate('multifactorAuthentication.reviewTransaction.attemptedTransaction'),
    };

    return (
        <View style={containerStyle}>
            <View style={styles.reportActionItemImagesContainer}>
                <View style={[styles.reportActionItemImages, StyleUtils.getHeight(variables.previewEReceiptHeight)]}>
                    <EReceiptWithSizeCalculation
                        transactionID={transactionID}
                        receiptType="default"
                        overrideTheme={receiptOverrideTheme}
                    />
                </View>
            </View>
            <View style={[styles.expenseAndReportPreviewBoxBody, styles.mtn1]}>
                <View style={styles.gap2}>
                    <View style={[styles.flexRow, styles.gap2]}>
                        <View style={[styles.flex1, styles.gap2]}>
                            <Text
                                style={[styles.textLabelSupporting, styles.lh16]}
                                numberOfLines={1}
                            >
                                {headerText}
                            </Text>
                            {shouldShowMerchantOrDescription && (
                                <Text
                                    fontSize={variables.fontSizeNormal}
                                    style={styles.flexShrink1}
                                    numberOfLines={1}
                                >
                                    {merchant}
                                </Text>
                            )}
                            {shouldShowCardEnding && (
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
                                    <Icon
                                        src={icons.CreditCard}
                                        height={variables.iconSizeExtraSmall}
                                        width={variables.iconSizeExtraSmall}
                                        fill={theme.icon}
                                    />
                                    <Text
                                        numberOfLines={1}
                                        style={[styles.textMicroSupporting, styles.pre, styles.flexShrink1]}
                                    >
                                        {cardEndingText}
                                    </Text>
                                </View>
                            )}
                        </View>
                        {!!displayAmount && (
                            <Text
                                fontSize={variables.fontSizeNormal}
                                style={[styles.flexShrink0, styles.alignSelfCenter]}
                                numberOfLines={1}
                            >
                                {displayAmount}
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}

export default AuthorizeCardTransactionPreview;
