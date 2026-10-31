import Badge from '@components/Badge';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import PaymentActivityTable from '@components/Tables/PaymentActivityTable';
import type {PaymentActivityRowData} from '@components/Tables/PaymentActivityTable';
import Text from '@components/Text';
import UserPill from '@components/UserPill';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetail, usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';

import {convertAmountToDisplayString} from '@libs/CurrencyUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {
    formatDate,
    getActiveUserAccountIDs,
    getBadgeAppearance,
    getBadgeText,
    getPaymentDetailsBadge,
    getPaymentHistoryRow,
    getReceiptSource,
    isInvoiceBilling,
} from '@libs/PaymentHistoryUtils';
import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import {openPaymentDetailsPage} from '@userActions/Subscription';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useEffect} from 'react';
import {View} from 'react-native';

type PaymentDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.SUBSCRIPTION.PAYMENT_DETAILS>;

function PaymentDetailsPage({route}: PaymentDetailsPageProps) {
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Receipt', 'InvoiceGeneric']);
    const {translate, dateFnsLocale, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const [purchases] = useOnyx(ONYXKEYS.PURCHASES);

    const purchaseID = Number(route.params.purchaseID);

    useEffect(() => {
        if (isOffline) {
            return;
        }
        openPaymentDetailsPage(purchaseID);
    }, [isOffline, purchaseID]);

    const purchase = purchases?.[String(purchaseID)];
    const billedToAccountID = purchase?.billedToAccountID;
    const [billedToDetails] = usePersonalDetail(billedToAccountID);
    const row = getPaymentHistoryRow(purchases, purchaseID);
    const activeUserAccountIDs = getActiveUserAccountIDs(purchase);
    const [activeUserPersonalDetails] = usePersonalDetailsByIDs(activeUserAccountIDs);

    if (purchases !== undefined && !row) {
        return <NotFoundPage />;
    }

    if (!purchase?.isLoaded) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    const dateLabel = row ? formatDate(row.created, dateFnsLocale) : '';
    const amountLabel = row ? convertAmountToDisplayString(row.amount, row.currency) : '';
    const {success, error} = getBadgeAppearance(row?.state ?? CONST.PAYMENT_HISTORY.STATE.PAID);

    const receiptSource = getReceiptSource(purchases, purchaseID);
    const isInvoice = isInvoiceBilling(purchases, purchaseID);

    const billedToName = temporaryGetDisplayNameOrDefault({passedPersonalDetails: billedToDetails, translate, formatPhoneNumber});

    const activeUsers: PaymentActivityRowData[] = activeUserAccountIDs.map((accountID) => {
        const details = activeUserPersonalDetails?.[accountID];
        return {
            keyForList: String(accountID),
            accountID,
            login: details?.login ?? '',
            name: temporaryGetDisplayNameOrDefault({passedPersonalDetails: details, translate, formatPhoneNumber}),
            email: formatPhoneNumber(details?.login ?? ''),
            action: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.PROFILE.getRoute(accountID))),
        };
    });
    const hasActiveUsers = activeUsers.length > 0;

    const detailsContent = (
        <>
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
            {!!billedToName && (
                <View style={[styles.ph5, styles.pv4, styles.gap2]}>
                    <Text style={styles.textLabelSupporting}>{translate('subscription.paymentHistory.billedTo')}</Text>
                    <UserPill
                        accountID={billedToAccountID}
                        avatar={billedToDetails?.avatar}
                        displayName={billedToName}
                        email={billedToDetails?.login}
                    />
                </View>
            )}
            {!!receiptSource && (
                <MenuItem.Root
                    onPress={() => {
                        Navigation.navigate(ROUTES.BILLING_RECEIPT.getRoute(purchaseID));
                    }}
                    sentryLabel={CONST.SENTRY_LABEL.SETTINGS_SUBSCRIPTION.VIEW_BILLING_RECEIPT}
                    accessibilityLabel={translate(isInvoice ? 'subscription.paymentHistory.viewInvoice' : 'subscription.paymentHistory.viewReceipt')}
                    style={[styles.ph5, styles.pv4]}
                >
                    <MenuItem.Row>
                        <MenuItem.Icon src={isInvoice ? expensifyIcons.InvoiceGeneric : expensifyIcons.Receipt} />
                        <MenuItem.Content>
                            <MenuItem.Title>{translate(isInvoice ? 'subscription.paymentHistory.viewInvoice' : 'subscription.paymentHistory.viewReceipt')}</MenuItem.Title>
                        </MenuItem.Content>
                        <MenuItem.Chevron />
                    </MenuItem.Row>
                </MenuItem.Root>
            )}
            {hasActiveUsers && (
                <Text
                    style={[styles.textLabelSupporting, styles.ph5, styles.pv2, styles.mb3]}
                    accessibilityRole={CONST.ROLE.HEADER}
                >
                    {translate('subscription.paymentHistory.activity')}
                </Text>
            )}
        </>
    );

    return (
        <ScreenWrapper
            testID={PaymentDetailsPage.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldShowOfflineIndicatorInWideScreen
            shouldEnableMaxHeight
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButtonAndTitle title={translate('subscription.paymentHistory.details')} />
                <View style={[styles.w100, styles.flex1]}>
                    <PaymentActivityTable
                        activeUsers={activeUsers}
                        countsMembers={!!row?.countsMembers}
                        headerComponent={detailsContent}
                    />
                </View>
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

PaymentDetailsPage.displayName = 'PaymentDetailsPage';

export default PaymentDetailsPage;
