import type {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as Transaction from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import DuplicateTransactionsList from './DuplicateTransactionsList';

function TransactionDuplicateReview() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const route = useRoute<RouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.REVIEW>>();
    const currentPersonalDetails = useCurrentUserPersonalDetails();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.threadReportID}`);
    const reportAction = ReportActionsUtils.getReportAction(report?.parentReportID, report?.parentReportActionID);
    const transactionID = ReportActionsUtils.getLinkedTransactionID(reportAction, report?.reportID) ?? '-1';
    const [transactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
    const duplicateTransactionIDs = useMemo(
        () => transactionViolations?.find((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)?.data?.duplicates ?? [],
        [transactionViolations],
    );
    const transactionIDs = [transactionID, ...duplicateTransactionIDs];

    const transactions = transactionIDs.map((item) => TransactionUtils.getTransaction(item)).sort((a, b) => new Date(a?.created ?? '').getTime() - new Date(b?.created ?? '').getTime());

    const keepAll = () => {
        Transaction.dismissDuplicateTransactionViolation(transactionIDs, currentPersonalDetails);
        Navigation.goBack();
    };

    const hasSettledOrApprovedTransaction = transactions.some((transaction) => ReportUtils.isSettled(transaction?.reportID) || ReportUtils.isReportApproved(transaction?.reportID));

    return (
        <ScreenWrapper testID={TransactionDuplicateReview.displayName}>
            <FullPageNotFoundView shouldShow={transactionID === '-1'}>
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
                <DuplicateTransactionsList transactions={transactions} />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

TransactionDuplicateReview.displayName = 'TransactionDuplicateReview';
export default TransactionDuplicateReview;
