import type {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as Transaction from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import DuplicateTransactionsList from './DuplicateTransactionsList';

function TransactionDuplicateReview() {
    const styles = useThemeStyles();
    const route = useRoute<RouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.REVIEW>>();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.threadReportID}`);
    const parentReportAction = ReportActionsUtils.getReportAction(report?.parentReportID ?? '', report?.parentReportActionID ?? '');
    const transactionID = parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? parentReportAction?.originalMessage.IOUTransactionID ?? '0' : '0';
    const [transactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
    const duplicateTransactionIDs = useMemo(
        () => transactionViolations?.find((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)?.data?.duplicates ?? [],
        [transactionViolations],
    );
    const keepAll = () => {
        Transaction.dismissDuplicateTransactionViolation(transactionID, duplicateTransactionIDs);
        Navigation.goBack();
    };
    return (
        <ScreenWrapper testID={TransactionDuplicateReview.displayName}>
            <HeaderWithBackButton title="Review duplicates" />
            <View style={[styles.justifyContentCenter, styles.pt3, styles.pl2, styles.pb4, styles.pr2, styles.borderBottom]}>
                <Button
                    text="Keep all"
                    onPress={keepAll}
                />
            </View>
            <DuplicateTransactionsList transactionIDs={[transactionID, ...duplicateTransactionIDs]} />
        </ScreenWrapper>
    );
}

TransactionDuplicateReview.displayName = 'TransactionDuplicateReview';
export default TransactionDuplicateReview;
