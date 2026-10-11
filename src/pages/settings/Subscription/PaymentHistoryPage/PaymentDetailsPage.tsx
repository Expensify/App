import Badge from '@components/Badge';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import {convertAmountToDisplayString} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type {PaymentDetailsBadge, PaymentHistoryRow} from '@libs/PaymentHistoryUtils';
import {getBadgeAppearance, getPaymentDetailsBadge, getPaymentHistoryRow, getStateTranslationKey} from '@libs/PaymentHistoryUtils';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import {openPaymentHistoryPage} from '@userActions/Subscription';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import type {Locale as DateFnsLocale} from 'date-fns';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {View} from 'react-native';

type PaymentDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.SUBSCRIPTION.PAYMENT_DETAILS>;

type TranslateFn = LocaleContextProps['translate'];

function formatDate(date: string, locale: DateFnsLocale | undefined): string {
    return DateUtils.formatWithUTCTimeZone(date, CONST.DATE.MONTH_DAY_YEAR_FORMAT, locale) || date;
}

/** Resolves the dynamic badge label shown only on the details page, falling back to the plain state label. */
function getBadgeText(badge: PaymentDetailsBadge, state: PaymentHistoryRow['state'], translate: TranslateFn, locale: DateFnsLocale | undefined): string {
    switch (badge.variant) {
        case 'balanceTransferTo':
            return translate('subscription.paymentHistory.badge.balanceTransferTo', {email: badge.email});
        case 'balanceTransferFrom':
            return translate('subscription.paymentHistory.badge.balanceTransferFrom', {email: badge.email});
        case 'disputed':
            if (badge.status === 'refunded') {
                return translate('subscription.paymentHistory.badge.disputedRefunded', {date: formatDate(badge.created, locale)});
            }
            if (badge.status === 'closed') {
                return translate('subscription.paymentHistory.badge.disputedClosed', {date: formatDate(badge.created, locale)});
            }
            return translate('subscription.paymentHistory.badge.disputedPending', {date: formatDate(badge.created, locale)});
        case 'refunded':
            return translate('subscription.paymentHistory.badge.refundedOn', {date: formatDate(badge.created, locale)});
        case 'refundedPartial':
            return translate('subscription.paymentHistory.badge.refundedAmountOn', {
                amount: convertAmountToDisplayString(badge.amount, badge.currency),
                date: formatDate(badge.created, locale),
            });
        default:
            return translate(getStateTranslationKey(state));
    }
}

function PaymentDetailsPage({route}: PaymentDetailsPageProps) {
    const {translate, dateFnsLocale} = useLocalize();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const [purchases] = useOnyx(ONYXKEYS.PURCHASES);

    const purchaseID = Number(route.params.purchaseID);
    const isBetaOn = isBetaEnabled(CONST.BETAS.PAYMENT_HISTORY);

    useFocusEffect(
        useCallback(() => {
            if (!isBetaOn) {
                return;
            }
            openPaymentHistoryPage();
        }, [isBetaOn]),
    );

    const row = getPaymentHistoryRow(purchases, purchaseID);

    // Wait for the list to load before deciding the bill is missing, so a deep link has a chance to resolve.
    if (!isBetaOn || (purchases !== undefined && !row)) {
        return <NotFoundPage />;
    }

    const dateLabel = row ? formatDate(row.created, dateFnsLocale) : '';
    const amountLabel = row ? convertAmountToDisplayString(row.amount, row.currency) : '';
    const {success, error} = getBadgeAppearance(row?.state ?? CONST.PAYMENT_HISTORY.STATE.PAID);

    return (
        <ScreenWrapper
            testID={PaymentDetailsPage.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldShowOfflineIndicatorInWideScreen
            shouldEnableMaxHeight
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButtonAndTitle title={translate('subscription.paymentHistory.details')} />
                <ScrollView>
                    {!!row && (
                        <View style={[styles.ph5, styles.pv4, styles.gap2]}>
                            <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                                <Text
                                    variant="text"
                                    style={[styles.popoverMenuText, styles.userSelectText]}
                                >
                                    {dateLabel}
                                </Text>
                                <Text
                                    variant="text"
                                    style={[styles.popoverMenuText, styles.userSelectText]}
                                >
                                    {amountLabel}
                                </Text>
                            </View>
                            <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                                <Badge
                                    text={getBadgeText(getPaymentDetailsBadge(purchases, purchaseID), row.state, translate, dateFnsLocale)}
                                    success={success}
                                    error={error}
                                    isCondensed
                                    badgeStyles={styles.ml0}
                                    textStyles={styles.userSelectText}
                                />
                                {row.showsTax && <Text style={[styles.textLabelSupporting, styles.userSelectText]}>{translate('subscription.paymentHistory.inclTax')}</Text>}
                            </View>
                        </View>
                    )}
                </ScrollView>
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

PaymentDetailsPage.displayName = 'PaymentDetailsPage';

export default PaymentDetailsPage;
