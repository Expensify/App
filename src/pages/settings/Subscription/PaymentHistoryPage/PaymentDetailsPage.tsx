import Badge from '@components/Badge';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import {convertAmountToDisplayString} from '@libs/CurrencyUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {formatDate, getBadgeAppearance, getBadgeText, getPaymentDetailsBadge, getPaymentHistoryRow} from '@libs/PaymentHistoryUtils';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

type PaymentDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.SUBSCRIPTION.PAYMENT_DETAILS>;

function PaymentDetailsPage({route}: PaymentDetailsPageProps) {
    const {translate, dateFnsLocale} = useLocalize();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const [purchases] = useOnyx(ONYXKEYS.PURCHASES);

    const purchaseID = Number(route.params.purchaseID);
    const isBetaOn = isBetaEnabled(CONST.BETAS.PAYMENT_HISTORY);

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
