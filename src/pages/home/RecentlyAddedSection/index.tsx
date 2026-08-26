import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useWideRHPActions} from '@components/WideRHPContextProvider';
import WidgetContainer from '@components/WidgetContainer';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsAnonymousUser from '@hooks/useIsAnonymousUser';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringFromFilterFormValues} from '@libs/SearchQueryUtils';
import type {TransactionThreadNavigationDescriptor} from '@libs/TransactionThreadNavigationUtils';
import {getReportIDToOpenForExpense} from '@libs/TransactionThreadNavigationUtils';

import WidgetHeaderMenu from '@pages/home/common/WidgetHeaderMenu/WidgetHeaderMenu';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {useIsFocused} from '@react-navigation/native';
import React from 'react';

import type {RecentlyAddedExpense} from './useRecentlyAddedData';

import RecentlyAddedPlaceholder from './RecentlyAddedPlaceholder';
import RecentlyAddedRow from './RecentlyAddedRow';
import {useRecentlyAddedData} from './useRecentlyAddedData';

function RecentlyAddedSection() {
    const {transactions, isAwaitingFirstResult} = useRecentlyAddedData();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    // The hovered receipt preview is a portal on document.body, so it isn't dismissed by navigation alone.
    // Once the screen blurs (e.g. after opening an expense), we hide the preview instead of leaving it floating over the RHP.
    const isFocused = useIsFocused();
    const icons = useMemoizedLazyExpensifyIcons(['Receipt']);
    const {markReportRHPWidth} = useWideRHPActions();
    const {email: currentUserEmail, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();
    const isAnonymousUser = useIsAnonymousUser();
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);

    const hasExpenses = transactions.length > 0;
    const listBottomPadding = shouldUseNarrowLayout ? styles.pb2 : styles.pb5;

    const openExpense = (expense: RecentlyAddedExpense) => {
        // Resolve only the tapped expense now. getReportIDToOpenForExpense may create a transaction thread, so
        // resolving every sibling up front would create a thread for each multi-expense sibling on a single tap.
        // Instead, seed the cheap snapshot-derived descriptors and let the carousel resolve each sibling lazily,
        // one at a time, only when the user actually navigates to it.
        const resolveContext = {introSelected, betas, conciergeChat, currentUserEmail, currentUserAccountID, personalDetails};
        const reportID = getReportIDToOpenForExpense(expense, resolveContext);

        const siblingTransactionIDs = transactions.map((sibling) => sibling.transactionID);
        const siblingDescriptorsByTransactionID = transactions.reduce<Record<string, TransactionThreadNavigationDescriptor>>((map, sibling) => {
            // eslint-disable-next-line no-param-reassign
            map[sibling.transactionID] = {
                reportID: sibling.reportID,
                transaction: sibling.transaction,
                reportAction: sibling.reportAction,
                report: sibling.report,
            };
            return map;
        }, {});

        // Each row opens a single-expense view that always lands in (Wide) RHP on both layouts so the carousel
        // arrows are available. Marking the report as an expense lets the RHP open wide immediately, before its
        // data loads, instead of flickering from narrow to wide.
        setActiveTransactionIDs(siblingTransactionIDs, siblingDescriptorsByTransactionID).then(() => {
            markReportRHPWidth(reportID, 'wide');
            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo: ROUTES.HOME}));
        });
    };

    const navigateToExpensesPage = () => {
        Navigation.navigate(
            ROUTES.SEARCH_ROOT.getRoute({
                query: buildQueryStringFromFilterFormValues({type: CONST.SEARCH.DATA_TYPES.EXPENSE}),
            }),
        );
    };

    // Guests (anonymous users) viewing a public room have no expenses of their own, so the section is hidden
    // entirely rather than showing the empty state.
    if (isAnonymousUser) {
        return null;
    }

    const overflowMenu = hasExpenses ? (
        <WidgetHeaderMenu
            testID="recentlyAddedOverflowMenu"
            sentryLabel="RecentlyAddedOverflowMenu"
            menuItems={[
                {
                    text: translate('homePage.recentlyAddedSection.viewAll'),
                    icon: icons.Receipt,
                    onSelected: navigateToExpensesPage,
                    shouldCallAfterModalHide: true,
                },
            ]}
        />
    ) : undefined;

    return (
        <WidgetContainer
            title={translate('homePage.recentlyAddedSection.title')}
            titleRightContent={overflowMenu}
            // The skeleton stands in for the rows, so it needs their bottom padding to avoid a jump when they land.
            // The empty state never had it, so it keeps its existing spacing.
            containerStyles={hasExpenses || isAwaitingFirstResult ? listBottomPadding : undefined}
        >
            {hasExpenses ? (
                transactions.map((expense, index) => (
                    <RecentlyAddedRow
                        key={expense.transactionID}
                        expense={expense}
                        onPress={() => openExpense(expense)}
                        shouldShowSeparator={index < transactions.length - 1}
                        shouldShowReceiptPreview={isFocused}
                        rowStyle={shouldUseNarrowLayout ? styles.ph5 : styles.ph8}
                    />
                ))
            ) : (
                <RecentlyAddedPlaceholder shouldShowSkeleton={isAwaitingFirstResult} />
            )}
        </WidgetContainer>
    );
}

export default RecentlyAddedSection;
