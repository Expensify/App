import EReceiptWithSizeCalculation from '@components/EReceiptWithSizeCalculation';
import * as eReceiptBGs from '@components/Icon/EReceiptBGs';
import Text from '@components/Text';
import TransactionPreviewSkeletonView from '@components/TransactionPreviewSkeletonView';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';
import {formatLastFourPAN} from '@libs/TransactionPreviewUtils';

import {fontScale} from '@styles/typography';
import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

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
    const {translate, dateFnsLocale} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['ReceiptBody', 'CreditCardExclamation']);
    const {convertToDisplayString, convertToDisplayStringWithoutCurrency} = useCurrencyListActions();

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

    const formattedDate = created ? DateUtils.formatToMonthDayWithOptionalYearInUTC(created, dateFnsLocale) : '';
    let displayAmount = '';
    if (amount !== undefined) {
        displayAmount = currency ? convertToDisplayString(amount, currency) : convertToDisplayStringWithoutCurrency(amount);
    }

    const formattedLastFourPAN = formatLastFourPAN(lastFourPAN);
    const cardEndingText = formattedLastFourPAN ? `${translate('paymentMethodList.accountLastFour')} ${formattedLastFourPAN}` : '';
    const supportingText = [formattedDate, cardEndingText].filter(Boolean).join(` ${CONST.DOT_SEPARATOR} `);
    const shouldShowMerchantOrDescription = !!merchant;

    const colorStyles = StyleUtils.getEReceiptColorStyles(CONST.ERECEIPT_COLORS.GREEN);
    const receiptOverrideTheme = {
        primaryColor: colorStyles?.backgroundColor,
        secondaryColor: colorStyles?.color,
        titleColor: colorStyles?.titleColor,
        MCCIcon: icons.CreditCardExclamation,
        backgroundImage: eReceiptBGs.EReceiptBGGreen,
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
                <View style={[styles.flexColumn, styles.gap1]}>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap2]}>
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                            {shouldShowMerchantOrDescription && (
                                <Text
                                    fontSize={fontScale.text}
                                    style={styles.flexShrink1}
                                    numberOfLines={1}
                                >
                                    {merchant}
                                </Text>
                            )}
                        </View>
                        {!!displayAmount && (
                            <Text
                                fontSize={fontScale.text}
                                style={styles.flexShrink0}
                                numberOfLines={1}
                            >
                                {displayAmount}
                            </Text>
                        )}
                    </View>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap2]}>
                        <Text
                            numberOfLines={1}
                            style={[styles.textLabelSupporting, styles.pre, styles.flexShrink1, styles.lh16]}
                        >
                            {supportingText}
                        </Text>
                        <Text
                            numberOfLines={1}
                            style={[styles.textLabelSupporting, styles.pre, styles.flexShrink0, styles.lh16]}
                        >
                            {translate('common.card')}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

export default AuthorizeCardTransactionPreview;
