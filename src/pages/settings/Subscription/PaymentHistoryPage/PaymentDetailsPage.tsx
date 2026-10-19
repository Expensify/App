import Badge from '@components/Badge';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import UserPill from '@components/UserPill';

import useDebouncedState from '@hooks/useDebouncedState';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {usePersonalDetail, usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';

import {convertAmountToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getSearchValueForPhoneOrEmail} from '@libs/OptionsListUtils';
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
import sortAlphabetically from '@libs/sortAlphabetically';
import tokenizedSearch from '@libs/tokenizedSearch';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import {openPaymentDetailsPage} from '@userActions/Subscription';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useEffect} from 'react';
import {View} from 'react-native';

import PaymentActivityListItem from './PaymentActivityListItem';

type PaymentDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.SUBSCRIPTION.PAYMENT_DETAILS>;

function PaymentDetailsPage({route}: PaymentDetailsPageProps) {
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Receipt', 'InvoiceGeneric']);
    const {translate, dateFnsLocale, formatPhoneNumber, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {isBetaEnabled} = usePermissions();
    const [purchases] = useOnyx(ONYXKEYS.PURCHASES);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');

    const purchaseID = Number(route.params.purchaseID);
    const isBetaOn = isBetaEnabled(CONST.BETAS.PAYMENT_HISTORY);

    useEffect(() => {
        if (!isBetaOn || isOffline) {
            return;
        }
        openPaymentDetailsPage(purchaseID);
    }, [isBetaOn, isOffline, purchaseID]);

    const purchase = purchases?.[String(purchaseID)];
    const billedToAccountID = purchase?.billedToAccountID;
    const [billedToDetails] = usePersonalDetail(billedToAccountID);
    const row = getPaymentHistoryRow(purchases, purchaseID);
    const activeUserAccountIDs = getActiveUserAccountIDs(purchase);
    const [activeUserPersonalDetails] = usePersonalDetailsByIDs(activeUserAccountIDs);

    if (!isBetaOn || (purchases !== undefined && !row)) {
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

    const activeUsers: ListItem[] = activeUserAccountIDs.map((accountID) => {
        const details = activeUserPersonalDetails?.[accountID];
        return {
            keyForList: String(accountID),
            accountID,
            login: details?.login ?? '',
            text: temporaryGetDisplayNameOrDefault({passedPersonalDetails: details, translate, formatPhoneNumber}),
            alternateText: formatPhoneNumber(details?.login ?? ''),
            isInteractive: false,
        };
    });
    const filteredActiveUsers = debouncedSearchTerm
        ? tokenizedSearch(activeUsers, getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode), (option) => [option.text ?? '', option.login ?? ''])
        : activeUsers;
    const sortedActiveUsers = sortAlphabetically(filteredActiveUsers, 'text', localeCompare);
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
            <Text
                style={[styles.textLabelSupporting, styles.ph5, styles.pv2, styles.mb3]}
                accessibilityRole={CONST.ROLE.HEADER}
            >
                {translate('subscription.paymentHistory.activity')}
            </Text>
        </>
    );

    // The count sits under the Activity header and tops the card the active user rows render into, so it's hidden when a search matches nobody.
    let activityHeader = null;
    if (!hasActiveUsers) {
        activityHeader = (
            <View style={[styles.mh5, styles.p4, styles.highlightBG, styles.borderRadiusComponentNormal]}>
                <Text style={[styles.textLabelSupporting, styles.userSelectText]}>{translate('subscription.paymentHistory.noActiveUsers')}</Text>
            </View>
        );
    } else if (sortedActiveUsers.length > 0) {
        activityHeader = (
            <View style={[styles.mh5, styles.ph4, styles.h9, styles.justifyContentCenter, styles.highlightBG, styles.tableTopRadius, styles.borderBottom]}>
                <Text
                    variant="micro"
                    style={[styles.textSupporting, styles.userSelectText]}
                >
                    {translate('subscription.paymentHistory.activeUsers', {count: activeUsers.length})}
                </Text>
            </View>
        );
    }

    return (
        <ScreenWrapper
            testID={PaymentDetailsPage.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldShowOfflineIndicatorInWideScreen
            shouldEnableMaxHeight
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButtonAndTitle title={translate('subscription.paymentHistory.details')} />
                <SelectionList
                    data={sortedActiveUsers}
                    ListItem={PaymentActivityListItem}
                    onSelectRow={() => {}}
                    customListHeaderContent={detailsContent}
                    customListHeader={activityHeader}
                    shouldHeaderBeInsideList
                    shouldShowTextInput={hasActiveUsers}
                    textInputOptions={{
                        label: translate('subscription.paymentHistory.findActiveUser'),
                        value: searchTerm,
                        onChangeText: setSearchTerm,
                        headerMessage: debouncedSearchTerm && !sortedActiveUsers.length ? translate('common.noResultsFound') : '',
                        disableAutoFocus: true,
                        shouldBeInsideList: true,
                        style: {inputWrapperStyle: styles.h11},
                    }}
                    shouldShowListEmptyContent={false}
                    showScrollIndicator
                />
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

PaymentDetailsPage.displayName = 'PaymentDetailsPage';

export default PaymentDetailsPage;
