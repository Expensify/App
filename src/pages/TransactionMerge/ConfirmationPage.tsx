import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/ButtonComposed';
import FixedFooter from '@components/FixedFooter';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MoneyRequestView from '@components/ReportActionItem/MoneyRequestView';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLocalize from '@hooks/useLocalize';
import useMergeTransactions from '@hooks/useMergeTransactions';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useSelfDMReport from '@hooks/useSelfDMReport';
import useThemeStyles from '@hooks/useThemeStyles';

import {mergeTransactionRequest} from '@libs/actions/MergeTransaction';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {buildMergedTransactionData, getTransactionThreadReportID} from '@libs/MergeTransactionUtils';
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

type ConfirmationPageProps = PlatformStackScreenProps<MergeTransactionNavigatorParamList, typeof SCREENS.MERGE_TRANSACTION.CONFIRMATION_PAGE>;

function ConfirmationPage({route}: ConfirmationPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isMergingExpenses, setIsMergingExpenses] = useState(false);

    const {transactionID, isOnSearch, backTo} = route.params;
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
    // Used to detect whether the target's report becomes a one-transaction thread report after the merge. This reads
    // the report-scoped derived value rather than filtering the whole transaction collection.
    const targetReportTransactionsCollection = useReportTransactionsCollection(targetTransaction?.reportID);
    const [targetTransactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${targetTransactionThreadReportID}`);
    const [targetTransactionThreadParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(targetTransactionThreadReport?.parentReportID)}`);
    const [targetTransactionThreadParentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(targetTransactionThreadReport?.parentReportID)}`);
    const [iouReportOwnerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(targetTransactionThreadParentReport?.ownerAccountID)});
    const [reportPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(targetTransactionThreadParentReport?.policyID)}`);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

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
            // When the expense stays in the same report, we try to keep the wide/super wide RHP underneath open by
            // only dismissing the merge modal (unless the report collapses into a one-transaction thread report).
            if (targetTransaction.reportID === mergeTransaction.reportID) {
                // When the target's report is left with a single transaction after the merge (e.g. merging the only two
                // expenses in a report), it becomes a one-transaction thread report. Keeping the previous wide/super wide
                // RHP open would leave both that report and the merged expense's thread stacked, so in that case we fall
                // through to the production path below (dismiss the whole modal, then open the merged expense).
                const isSourceInTargetReport = sourceTransaction.reportID === targetTransaction.reportID;
                // Only real reports collapse into a one-transaction thread report. The unreported/split sentinels are
                // shared across expenses, so counting transactions by them would match unrelated expenses app-wide.
                const isRealTargetReport = targetTransaction.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID && targetTransaction.reportID !== CONST.REPORT.SPLIT_REPORT_ID;
                const targetReportTransactionCount = Object.values(targetReportTransactionsCollection ?? {}).filter(Boolean).length;
                const willTargetReportBeOneTransactionReport = isRealTargetReport && targetReportTransactionCount - (isSourceInTargetReport ? 1 : 0) <= 1;

                if (!willTargetReportBeOneTransactionReport) {
                    // The report stays a multi-transaction report, so keep the wide/super wide RHP underneath open and
                    // only open the merged expense's thread if it isn't already the topmost RHP.
                    Navigation.dismissToPreviousRHP();
                    const isTargetThreadStillOpen = !!targetTransactionThreadReportID && Navigation.getTopmostSearchReportID() === targetTransactionThreadReportID;
                    if (!isTargetThreadStillOpen) {
                        Navigation.setNavigationActionToMicrotaskQueue(() => {
                            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: searchReportIDToOpen}));
                        });
                    }
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
                        Navigation.goBack(backTo);
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

export default ConfirmationPage;
