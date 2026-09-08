import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/ButtonComposed';
import FixedFooter from '@components/FixedFooter';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MoneyRequestView from '@components/ReportActionItem/MoneyRequestView';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useSearchResultsContext} from '@components/Search/SearchContext';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLocalize from '@hooks/useLocalize';
import useMergeTransactions from '@hooks/useMergeTransactions';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useSelfDMReport from '@hooks/useSelfDMReport';
import useThemeStyles from '@hooks/useThemeStyles';

import {mergeTransactionRequest} from '@libs/actions/MergeTransaction';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {buildMergedTransactionData, getTransactionThreadReportID, willReportBecomeOneTransactionReportAfterMerge} from '@libs/MergeTransactionUtils';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MergeTransactionNavigatorParamList} from '@libs/Navigation/types';
import {getFilteredReportActionsForReportView, getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {findSelfDMReportID} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';
import type {Transaction} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React, {useState} from 'react';
import {View} from 'react-native';

type DynamicConfirmationPageProps = PlatformStackScreenProps<MergeTransactionNavigatorParamList, typeof SCREENS.MERGE_TRANSACTION.DYNAMIC_CONFIRMATION_PAGE>;

function DynamicConfirmationPage({route}: DynamicConfirmationPageProps) {
    const {translate} = useLocalize();
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const [isMergingExpenses, setIsMergingExpenses] = useState(false);

    const {transactionID, isOnSearch} = route.params;
    const [mergeTransaction, mergeTransactionMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`);
    const {targetTransaction, sourceTransaction, targetTransactionReport, targetTransactionPolicy} = useMergeTransactions({mergeTransaction});
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);

    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${targetTransactionPolicy?.id}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${targetTransactionPolicy?.id}`);

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const targetTransactionThreadReportID = getTransactionThreadReportID(targetTransaction);
    // Expenses already in the target report, used to tell if only one will be left after merging.
    const targetReportTransactionsCollection = useReportTransactionsCollection(targetTransaction?.reportID);
    // Report actions of the target report, so the remaining-expense count ignores rows whose IOU action was deleted.
    const [targetReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(targetTransaction?.reportID)}`);
    // Reports opened from Search may not be in Onyx yet, so we also read the expenses from the Search snapshot.
    const {currentSearchResults} = useSearchResultsContext();
    const [targetTransactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${targetTransactionThreadReportID}`);
    const [targetTransactionThreadParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(targetTransactionThreadReport?.parentReportID)}`);
    const [iouReportOwnerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: personalDetailsLoginSelector(targetTransactionThreadParentReport?.ownerAccountID),
    });
    const [reportPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(targetTransactionThreadParentReport?.policyID)}`);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {
        selector: isTrackIntentUserSelector,
    });

    const selfDMReport = useSelfDMReport();
    const [selfDMReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(selfDMReport?.reportID)}`);

    const [sourceReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(sourceTransaction?.reportID)}`);
    const sourceIOUAction = sourceTransaction ? getIOUActionForTransactionID(Object.values(sourceReportActions ?? {}), sourceTransaction.transactionID) : undefined;
    const [sourceTransactionThreadReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(sourceIOUAction?.childReportID)}`);

    // Build the merged transaction data for display
    const mergedTransactionData = buildMergedTransactionData(targetTransaction, mergeTransaction);

    const mergeExpenses = () => {
        if (!targetTransaction || !mergeTransaction || !sourceTransaction) {
            return;
        }
        const reportID = mergeTransaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID ? (findSelfDMReportID() ?? CONST.REPORT.UNREPORTED_REPORT_ID) : mergeTransaction.reportID;

        // When the surviving expense is moved off its original report and that report held only this one expense,
        // mergeTransactionRequest optimistically deletes the report. Capture that here (before the optimistic update runs)
        // so we can replace the now-deleted report screen instead of pushing on top of it — otherwise the stale screen
        // lingers in the stack and briefly flashes the "not found" page when the user taps back. Must be read pre-merge.
        const willDeleteTargetTransactionReport = Object.keys(targetReportTransactionsCollection ?? {}).length === 1;

        setIsMergingExpenses(true);

        mergeTransactionRequest({
            getCurrencyDecimals,
            getCurrencySymbol,
            mergeTransactionID: transactionID,
            mergeTransaction,
            targetTransaction,
            sourceTransaction,
            targetTransactionThreadReport,
            targetTransactionThreadParentReport,
            iouReportOwnerLogin,
            allTransactionViolations,
            policy: targetTransactionPolicy,
            policyTags,
            policyCategories,
            currentUserAccountIDParam,
            currentUserEmailParam,
            isASAPSubmitBetaEnabled,
            delegateAccountID,
            isTrackIntentUser,
            selfDMReport,
            selfDMReportActions,
            reportPolicyTags,
            sourceTransactionThreadReportActions,
            sourceIOUAction,
        });

        const reportIDToDismiss = reportID !== CONST.REPORT.UNREPORTED_REPORT_ID ? reportID : undefined;

        const searchReportIDToOpen = targetTransactionThreadReportID ?? reportIDToDismiss;

        // In search, dismiss the merge modal and reopen the expense in the RHP.
        if ((isOnSearch || isSearchTopmostFullScreenRoute()) && searchReportIDToOpen) {
            if (targetTransaction.reportID === mergeTransaction.reportID) {
                // Only keep the RHP underneath if it belongs to the target. A swapped merge (e.g. cash into a
                // card/split expense) leaves the source's report underneath, so fall through to the full dismiss.
                const topmostSearchReportID = Navigation.getTopmostSearchReportID();
                const isTargetThreadTopmost = !!targetTransactionThreadReportID && topmostSearchReportID === targetTransactionThreadReportID;
                const isTargetReportUnderneath = Navigation.getTopmostSuperWideRHPReportID() === targetTransaction.reportID;

                if (isTargetThreadTopmost || isTargetReportUnderneath) {
                    // A report left with a single expense becomes a one-transaction thread, so fall through to the full dismiss.
                    const willTargetReportBeOneTransactionReport = willReportBecomeOneTransactionReportAfterMerge(
                        targetTransaction.reportID,
                        sourceTransaction.transactionID,
                        targetReportTransactionsCollection,
                        currentSearchResults?.data,
                        getFilteredReportActionsForReportView(Object.values(targetReportActions ?? {})),
                        isOffline,
                    );

                    if (!willTargetReportBeOneTransactionReport) {
                        if (isTargetThreadTopmost) {
                            // The target's own thread is already the RHP underneath, so just close the merge modal to reveal it.
                            Navigation.dismissToPreviousRHP();
                            return;
                        }

                        // The target's report is underneath but another thread may sit on top, so dismiss to that shared
                        // report to clear the stale thread, then open the merged expense's thread over it.
                        Navigation.dismissToSuperWideRHP();

                        // Without a thread to open, searchReportIDToOpen falls back to the report we just revealed,
                        // so navigating would stack it on top of itself.
                        if (searchReportIDToOpen === targetTransaction.reportID) {
                            return;
                        }

                        Navigation.setNavigationActionToMicrotaskQueue(() => {
                            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: searchReportIDToOpen}));
                        });
                        return;
                    }
                }
            }

            Navigation.dismissModal();
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: searchReportIDToOpen}));
            });
            return;
        }

        if (reportIDToDismiss && reportID !== targetTransaction.reportID) {
            Navigation.dismissModalWithReport({reportID: reportIDToDismiss}, undefined, {forceReplace: willDeleteTargetTransactionReport});
            return;
        }

        Navigation.dismissToSuperWideRHP();
    };

    if (isLoadingOnyxValue(mergeTransactionMetadata)) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            testID="ConfirmationPage"
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
        >
            <FullPageNotFoundView shouldShow={!mergeTransaction && !isMergingExpenses}>
                <HeaderWithBackButton
                    title={translate('transactionMerge.confirmationPage.header')}
                    onBackButtonPress={() => {
                        Navigation.goBack();
                    }}
                />
                <ScrollView>
                    <View style={[styles.ph5, styles.pb8]}>
                        <Text>{translate('transactionMerge.confirmationPage.pageTitle')}</Text>
                    </View>
                    <MoneyRequestView
                        expensePolicy={targetTransactionPolicy}
                        parentReportID={targetTransactionReport?.reportID}
                        shouldShowAnimatedBackground={false}
                        readonly
                        updatedTransaction={mergedTransactionData as unknown as OnyxEntry<Transaction>}
                        mergeTransactionID={transactionID}
                    />
                </ScrollView>
                <FixedFooter style={styles.ph5}>
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        onPress={mergeExpenses}
                        size={CONST.BUTTON_SIZE.LARGE}
                    >
                        <Button.Text>{translate('transactionMerge.confirmationPage.confirmButton')}</Button.Text>
                    </Button>
                </FixedFooter>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default DynamicConfirmationPage;
