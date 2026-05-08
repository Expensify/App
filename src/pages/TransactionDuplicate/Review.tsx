import {useFocusEffect, useRoute} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ReportHeaderSkeletonView from '@components/ReportHeaderSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {clearDeleteTransactionNavigateBackUrl, openReport} from '@libs/actions/Report';
import {dismissDuplicateTransactionViolation, getDuplicateTransactionDetails} from '@libs/actions/Transaction';
import {setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import {getLinkedTransactionID, getReportAction} from '@libs/ReportActionsUtils';
import {isReportIDApproved, isSettled} from '@libs/ReportUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import {doesDeleteNavigateBackUrlIncludeSpecificDuplicatesReview, getParentReportActionDeletionStatus, hasLoadedReportActions, isThreadReportDeleted} from '@libs/TransactionNavigationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import DuplicateTransactionsList from './DuplicateTransactionsList';

function TransactionDuplicateReview() {
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.REVIEW>>();

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const currentPersonalDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const {isOffline} = useNetwork();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.threadReportID}`);
    const [parentReportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${report?.parentReportID}`);
    const [deleteTransactionNavigateBackUrl] = useOnyx(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL);
    const [reportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${route.params.threadReportID}`);
    const [expenseReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [transactionIDsList = getEmptyArray<string>()] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);

    const originalTransactionIDsListRef = useRef<string[] | null>(null);

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const reportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
    const transactionID = getLinkedTransactionID(reportAction);
    const transactionViolations = useTransactionViolations(transactionID);
    const duplicateTransactionIDs = transactionViolations?.find((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)?.data?.duplicates ?? [];
    const transactionIDs = transactionID ? [transactionID, ...duplicateTransactionIDs] : duplicateTransactionIDs;

    const transactions: Transaction[] = [];
    for (const id of transactionIDs) {
        const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`];
        if (transaction) {
            transactions.push(transaction);
        }
    }
    transactions.sort((a, b) => new Date(a?.created ?? '').getTime() - new Date(b?.created ?? '').getTime());

    const hasSettledOrApprovedTransaction = transactions.some((transaction) => isSettled(transaction?.reportID) || isReportIDApproved(transaction?.reportID));
    const hasLoadedThreadReportActions = hasLoadedReportActions(reportLoadingState, isOffline);
    const isThreadReportDeletedForReview = isThreadReportDeleted(report, reportLoadingState, isOffline);
    const {hasLoadedParentReportActions, wasParentActionDeleted} = getParentReportActionDeletionStatus({
        parentReportID: report?.parentReportID,
        parentReportActionID: report?.parentReportActionID,
        parentReportAction: reportAction,
        parentReportLoadingState,
        isOffline,
        shouldRequireParentReportActionID: false,
        shouldTreatMissingParentReportAsDeleted: true,
    });
    const wasTransactionDeleted = isThreadReportDeletedForReview || wasParentActionDeleted;
    const isLoadingPage =
        (!report?.reportID && !hasLoadedThreadReportActions && !isThreadReportDeletedForReview) ||
        (!reportAction?.reportActionID && !hasLoadedParentReportActions && !wasParentActionDeleted && !isThreadReportDeletedForReview);
    const isDeleteNavigateBackToThisReview = doesDeleteNavigateBackUrlIncludeSpecificDuplicatesReview(deleteTransactionNavigateBackUrl, route.params.threadReportID);
    const isNavigatingBackToDeletedReview = !!deleteTransactionNavigateBackUrl && !(isDeleteNavigateBackToThisReview && wasTransactionDeleted);

    const shouldShowNotFound = !isNavigatingBackToDeletedReview && (wasTransactionDeleted || (!isLoadingPage && !transactionID));

    const reasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'TransactionDuplicateReview',
        hasLoadedThreadReportActions,
        hasLoadedParentReportActions,
    };

    useEffect(() => {
        if (!route.params.threadReportID || report?.reportID) {
            return;
        }
        openReport({reportID: route.params.threadReportID, introSelected, betas});
    }, [report?.reportID, route.params.threadReportID, introSelected, betas]);

    useEffect(() => {
        if (!transactionID) {
            return;
        }
        getDuplicateTransactionDetails(transactionID);
    }, [transactionID]);

    useEffect(() => {
        if (!isDeleteNavigateBackToThisReview || !wasTransactionDeleted) {
            return;
        }
        clearDeleteTransactionNavigateBackUrl();
    }, [isDeleteNavigateBackToThisReview, wasTransactionDeleted]);

    useFocusEffect(() => {
        return () => {
            if (!deleteTransactionNavigateBackUrl) {
                return;
            }
            clearDeleteTransactionNavigateBackUrl();
        };
    });

    useFocusEffect(() => {
        if (!originalTransactionIDsListRef.current) {
            return;
        }
        setActiveTransactionIDs(originalTransactionIDsListRef.current);
    });

    const onPreviewPressed = (reportID: string) => {
        const siblingTransactionIDsList = transactions.map((transaction) => transaction.transactionID);
        setActiveTransactionIDs(siblingTransactionIDsList).then(() => {
            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo: Navigation.getActiveRoute()}));
        });
        // Store the initial value of transactionIDsList and only save it when the item is clicked for the first time
        // to ensure that transactionIDsList reflects its original value when this component is mounted
        if (!originalTransactionIDsListRef.current) {
            originalTransactionIDsListRef.current = transactionIDsList;
        }
    };

    const keepAll = () => {
        dismissDuplicateTransactionViolation({
            transactionIDs,
            dismissedPersonalDetails: currentPersonalDetails,
            expenseReport,
            policy,
            isASAPSubmitBetaEnabled,
            allTransactions,
        });
        Navigation.goBack();
    };

    if (isLoadingPage) {
        return (
            <ScreenWrapper testID="TransactionDuplicateReview">
                <View style={[styles.flex1]}>
                    <View style={[styles.appContentHeader, styles.borderBottom]}>
                        <ReportHeaderSkeletonView
                            onBackButtonPress={() => {}}
                            reasonAttributes={reasonAttributes}
                        />
                    </View>
                    <ReportActionsSkeletonView />
                </View>
            </ScreenWrapper>
        );
    }

    if (!shouldShowNotFound && transactionID && duplicateTransactionIDs.length === 0) {
        return (
            <ScreenWrapper testID="TransactionDuplicateReview">
                <HeaderWithBackButton
                    title={translate('iou.reviewDuplicates')}
                    onBackButtonPress={() => Navigation.goBack(route.params.backTo)}
                />
                <ConfirmationPage
                    heading={translate('iou.noDuplicatesTitle')}
                    description={translate('iou.noDuplicatesDescription')}
                    shouldShowButton
                    buttonText={translate('common.buttonConfirm')}
                    onButtonPress={() => Navigation.goBack(route.params.backTo)}
                />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper testID="TransactionDuplicateReview">
            <FullPageNotFoundView shouldShow={shouldShowNotFound}>
                <HeaderWithBackButton
                    title={translate('iou.reviewDuplicates')}
                    onBackButtonPress={() => Navigation.goBack(route.params.backTo)}
                />
                <View style={[styles.justifyContentCenter, styles.ph5, styles.pb3, styles.borderBottom]}>
                    <Button
                        text={translate('iou.keepAll')}
                        onPress={keepAll}
                    />
                    {!!hasSettledOrApprovedTransaction && <Text style={[styles.textNormal, styles.colorMuted, styles.mt3]}>{translate('iou.someDuplicatesArePaid')}</Text>}
                </View>
                <DuplicateTransactionsList
                    transactions={transactions}
                    onPreviewPressed={onPreviewPressed}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default TransactionDuplicateReview;
