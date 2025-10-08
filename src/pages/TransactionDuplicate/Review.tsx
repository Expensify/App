import {useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo} from 'react';
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
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import {getLinkedTransactionID, getReportAction} from '@libs/ReportActionsUtils';
import {isReportIDApproved, isSettled} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import DuplicateTransactionsList from './DuplicateTransactionsList';

function TransactionDuplicateReview() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.REVIEW>>();
    const currentPersonalDetails = useCurrentUserPersonalDetails();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.threadReportID}`, {canBeMissing: true});
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${route.params.threadReportID}`, {canBeMissing: true});
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

    const keepAll = () => {
        dismissDuplicateTransactionViolation(transactionIDs, currentPersonalDetails);
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
                <DuplicateTransactionsList transactions={transactions ?? []} />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

TransactionDuplicateReview.displayName = 'TransactionDuplicateReview';
export default TransactionDuplicateReview;
