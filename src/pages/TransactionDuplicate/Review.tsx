import {useFocusEffect, useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ReportHeaderSkeletonView from '@components/ReportHeaderSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {openReport} from '@libs/actions/Report';
import {dismissDuplicateTransactionViolation} from '@libs/actions/Transaction';
import {setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import Permissions from '@libs/Permissions';
import {getLinkedTransactionID, getReportAction} from '@libs/ReportActionsUtils';
import {isReportIDApproved, isSettled} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import DuplicateTransactionsList from './DuplicateTransactionsList';

function TransactionDuplicateReview() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.REVIEW>>();
    const currentPersonalDetails = useCurrentUserPersonalDetails();
    const [allBetas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const isASAPSubmitBetaEnabled = Permissions.isBetaEnabled(CONST.BETAS.ASAP_SUBMIT, allBetas);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.threadReportID}`, {canBeMissing: true});
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${route.params.threadReportID}`, {canBeMissing: true});
    const [expenseReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`, {canBeMissing: false});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {canBeMissing: false});
    const reportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
    const transactionID = getLinkedTransactionID(reportAction);
    const transactionViolations = useTransactionViolations(transactionID);
    const duplicateTransactionIDs = useMemo(
        () => transactionViolations?.find((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)?.data?.duplicates ?? [],
        [transactionViolations],
    );
    const transactionIDs = useMemo(() => (transactionID ? [transactionID, ...duplicateTransactionIDs] : duplicateTransactionIDs), [transactionID, duplicateTransactionIDs]);
    const transactionsSelector = useCallback(
        (allTransactions: OnyxCollection<Transaction>) =>
            transactionIDs
                .map((id) => allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`])
                .filter((transaction) => !!transaction)
                .sort((a, b) => new Date(a?.created ?? '').getTime() - new Date(b?.created ?? '').getTime()),
        [transactionIDs],
    );

    const [transactions] = useOnyx(
        ONYXKEYS.COLLECTION.TRANSACTION,
        {
            selector: transactionsSelector,
            canBeMissing: true,
        },
        [transactionIDs],
    );
    const originalTransactionIDsListRef = useRef<string[] | null>(null);
    const [transactionIDsList = getEmptyArray<string>()] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, {
        canBeMissing: true,
    });

    const onPreviewPressed = useCallback(
        (reportID: string) => {
            const siblingTransactionIDsList = transactions?.map((transaction) => transaction.transactionID) ?? [];
            setActiveTransactionIDs(siblingTransactionIDsList).then(() => {
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo: Navigation.getActiveRoute()}));
            });
            // Store the initial value of transactionIDsList and only save it when the item is clicked for the first time
            // to ensure that transactionIDsList reflects its original value when this component is mounted
            if (!originalTransactionIDsListRef.current) {
                originalTransactionIDsListRef.current = transactionIDsList;
            }
        },
        [transactionIDsList, transactions],
    );

    useFocusEffect(
        useCallback(() => {
            if (!originalTransactionIDsListRef.current) {
                return;
            }
            setActiveTransactionIDs(originalTransactionIDsListRef.current);
        }, []),
    );

    const keepAll = () => {
        dismissDuplicateTransactionViolation(transactionIDs, currentPersonalDetails, expenseReport, policy, isASAPSubmitBetaEnabled);
        Navigation.goBack();
    };

    const hasSettledOrApprovedTransaction = transactions?.some((transaction) => isSettled(transaction?.reportID) || isReportIDApproved(transaction?.reportID));

    useEffect(() => {
        if (!route.params.threadReportID || report?.reportID) {
            return;
        }
        openReport(route.params.threadReportID);
    }, [report?.reportID, route.params.threadReportID]);

    const isLoadingPage = (!report?.reportID && reportMetadata?.isLoadingInitialReportActions !== false) || !reportAction?.reportActionID;

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFound = !isLoadingPage && !transactionID;

    if (isLoadingPage) {
        return (
            <ScreenWrapper testID={TransactionDuplicateReview.displayName}>
                <View style={[styles.flex1]}>
                    <View style={[styles.appContentHeader, styles.borderBottom]}>
                        <ReportHeaderSkeletonView onBackButtonPress={() => {}} />
                    </View>
                    <ReportActionsSkeletonView />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper testID={TransactionDuplicateReview.displayName}>
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
                    transactions={transactions ?? []}
                    onPreviewPressed={onPreviewPressed}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

TransactionDuplicateReview.displayName = 'TransactionDuplicateReview';
export default TransactionDuplicateReview;
