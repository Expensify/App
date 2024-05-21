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
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import variables from '@styles/variables';
import * as IOU from '@src/libs/actions/IOU';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';

function Confirm() {
    const styles = useThemeStyles();
    const route = useRoute<RouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.REVIEW>>();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.threadReportID}`);
    const [reviewDuplicates] = useOnyx(ONYXKEYS.REVIEW_DUPLICATES);
    const [originalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${reviewDuplicates?.transactionID}`);
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
        IOU.mergeDuplicates({...transaction}, reviewDuplicates?.duplicates);
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
