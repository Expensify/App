import type {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MoneyRequestView from '@components/ReportActionItem/MoneyRequestView';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import {use} from '@libs/Request';
import variables from '@styles/variables';
import * as IOU from '@src/libs/actions/IOU';
import * as ReportActionsUtils from '@src/libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';

function Confirm() {
    const styles = useThemeStyles();
    const route = useRoute<RouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.REVIEW>>();
    const [reviewDuplicates] = useOnyx(ONYXKEYS.REVIEW_DUPLICATES);
    const [originalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${reviewDuplicates?.transactionID}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.threadReportID}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalTransaction?.reportID}`);
    const reportAction = Object.values(reportActions ?? {}).find((action) => action.actionName === 'IOU' && action.originalMessage.IOUTransactionID === reviewDuplicates?.transactionID);

    const transaction: Transaction = {
        ...originalTransaction,
        category: reviewDuplicates?.category,
        comment: {comment: reviewDuplicates?.description},
        billable: reviewDuplicates?.billable,
        reimbursable: reviewDuplicates?.reimbursable,
        tag: reviewDuplicates?.tag,
        taxCode: reviewDuplicates?.taxCode,
        taxAmount: reviewDuplicates?.taxAmount,
        modifiedMerchant: reviewDuplicates?.merchant,
        transactionID: reviewDuplicates?.transactionID ?? '',
    };

    const mergeDuplicates = () => {
        IOU.mergeDuplicates({
            transactionID: reviewDuplicates?.transactionID ?? '',
            transactionIDs: reviewDuplicates?.duplicates ?? [],
            amount: originalTransaction?.modifiedAmount ?? 0,
            reportID: originalTransaction?.reportID ?? '',
            billable: reviewDuplicates?.billable ?? false,
            reimbursable: reviewDuplicates?.reimbursable ?? false,
            category: reviewDuplicates?.category ?? '',
            tag: reviewDuplicates?.tag ?? '',
            // taxCode: reviewDuplicates?.taxCode,
            // taxAmount: reviewDuplicates?.taxAmount,
            merchant: reviewDuplicates?.merchant ?? '',
            comment: reviewDuplicates?.description ?? '',
            receiptID: originalTransaction?.receipt?.receiptID ?? 0,
            created: originalTransaction?.created ?? '',
            currency: originalTransaction?.currency ?? '',
        });

        // console.log('originalTransaction', originalTransaction);
        // console.log('reportID', originalTransaction?.reportID);
        // console.log('parentReport', parentReport);
        console.log('reportActions', reportActions);
        console.log('reportAction', reportAction);

        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportAction?.childReportID ?? '0'));
    };

    return (
        <ScreenWrapper
            testID={Confirm.displayName}
            shouldShowOfflineIndicator
        >
            <HeaderWithBackButton title="Review duplicates" />
            <View style={[styles.ph5, styles.pb8]}>
                <Text
                    family="EXP_NEW_KANSAS_MEDIUM"
                    fontSize={variables.fontSizeLarge}
                    style={styles.pb5}
                >
                    Confirm the details you&apos;re keeping
                </Text>
                <Text>The duplicate requests you don&apos;t keep will be held for the member to delete</Text>
            </View>
            <MoneyRequestView
                report={report}
                shouldShowAnimatedBackground={false}
                nonEditableMode
                transactionTest={transaction}
            />
            <Button
                text="Confirm"
                success
                style={styles.ph5}
                onPress={mergeDuplicates}
            />
        </ScreenWrapper>
    );
}

Confirm.displayName = 'Confirm';

export default Confirm;
