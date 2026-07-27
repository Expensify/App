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
import {findSelfDMReportID} from '@libs/ReportUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

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
    // Reports opened from Search may not be in Onyx yet, so we also read the expenses from the Search snapshot.
    const {currentSearchResults} = useSearchResultsContext();
    const [targetTransactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${targetTransactionThreadReportID}`);
    const [targetTransactionThreadParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(targetTransactionThreadReport?.parentReportID)}`);
    const [targetTransactionThreadParentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(targetTransactionThreadReport?.parentReportID)}`);
    const [iouReportOwnerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: personalDetailsLoginSelector(targetTransactionThreadParentReport?.ownerAccountID),
    });
    const [reportPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(targetTransactionThreadParentReport?.policyID)}`);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {
        selector: isTrackIntentUserSelector,
    });

    const selfDMReport = useSelfDMReport();
    const [selfDMReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(selfDMReport?.reportID)}`);

    // Build the merged transaction data for display
    const mergedTransactionData = buildMergedTransactionData(targetTransaction, mergeTransaction);

    const mergeExpenses = () => {
        if (!targetTransaction || !mergeTransaction || !sourceTransaction) {
            return;
        }
        const reportID = mergeTransaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID ? (findSelfDMReportID() ?? CONST.REPORT.UNREPORTED_REPORT_ID) : mergeTransaction.reportID;

        setIsMergingExpenses(true);

        mergeTransactionRequest({
            mergeTransactionID: transactionID,
            mergeTransaction,
            targetTransaction,
            sourceTransaction,
            targetTransactionThreadReport,
            targetTransactionThreadParentReport,
            targetTransactionThreadParentReportNextStep,
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
        });

        const reportIDToDismiss = reportID !== CONST.REPORT.UNREPORTED_REPORT_ID ? reportID : undefined;

        const searchReportIDToOpen = targetTransactionThreadReportID ?? reportIDToDismiss;

        // If we're in search (or the topmost route is search), dismiss the modal and open the expense in the RHP
        if ((isOnSearch || isSearchTopmostFullScreenRoute()) && searchReportIDToOpen) {
            // The expense stays in the same report, so we can keep the RHP underneath open by just closing the merge modal.
            if (targetTransaction.reportID === mergeTransaction.reportID) {
                // But if the report is left with a single expense, it turns into a one-transaction thread report and
                // keeping the RHP open would stack it on top of the expense thread. Fall through to the full dismiss below.
                const willTargetReportBeOneTransactionReport = willReportBecomeOneTransactionReportAfterMerge(
                    targetTransaction.reportID,
                    sourceTransaction.transactionID,
                    targetReportTransactionsCollection,
                    currentSearchResults,
                    isOffline,
                );

                // Only keep the RHP underneath when it actually belongs to the target. If the merge swapped target and
                // source (e.g. merging a cash expense into a selected card/split expense), the RHP underneath is the
                // source's, so we fall through to the full dismiss below instead of leaving that stale report stacked.
                const topmostSearchReportID = Navigation.getTopmostSearchReportID();
                const isTargetThreadTopmost = !!targetTransactionThreadReportID && topmostSearchReportID === targetTransactionThreadReportID;
                const isTargetReportUnderneath = Navigation.getTopmostSuperWideRHPReportID() === targetTransaction.reportID;

                if (!willTargetReportBeOneTransactionReport && (isTargetThreadTopmost || isTargetReportUnderneath)) {
                    if (isTargetThreadTopmost) {
                        // The target's own thread is already the RHP underneath, so just close the merge modal to reveal it.
                        Navigation.dismissToPreviousRHP();
                        return;
                    }

                    // The target's multi-expense report is underneath, but a different thread may sit on top of it (e.g.
                    // the swapped-away source's thread). Dismiss down to that shared super wide report so the stale thread
                    // isn't left stacked, then open the merged expense's thread over it.
                    Navigation.dismissToSuperWideRHP();
                    Navigation.setNavigationActionToMicrotaskQueue(() => {
                        Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: searchReportIDToOpen}));
                    });
                    return;
                }
            }

            Navigation.dismissModal();
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: searchReportIDToOpen}));
            });
            return;
        }

        if (reportIDToDismiss && reportID !== targetTransaction.reportID) {
            Navigation.dismissModalWithReport({reportID: reportIDToDismiss});
            return;
        }

        Navigation.dismissToSuperWideRHP();
    };

    if (isLoadingOnyxValue(mergeTransactionMetadata)) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'TransactionMerge.ConfirmationPage',
            isLoadingMergeTransaction: isLoadingOnyxValue(mergeTransactionMetadata),
        };
        return <FullScreenLoadingIndicator reasonAttributes={reasonAttributes} />;
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
