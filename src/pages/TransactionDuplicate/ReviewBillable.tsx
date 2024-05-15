import type {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useReviewDuplicatesNavigation from '@hooks/useReviewDuplicatesNavigation';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import * as TransactionUtils from '@libs/TransactionUtils';
import type SCREENS from '@src/SCREENS';
import ReviewFields from './ReviewFields';

function ReviewBillable() {
    const route = useRoute<RouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.TAG>>();
    const transactionID = TransactionUtils.getTransactionID(route.params.threadReportID ?? '');
    const compareResult = TransactionUtils.compareDuplicateTransactionFields(transactionID);
    const stepNames = Object.keys(compareResult.change ?? {}).map((key, index) => (index + 1).toString());
    const {currentScreenIndex, navigateToNextScreen} = useReviewDuplicatesNavigation(Object.keys(compareResult.change ?? {}), 'billable', route.params.threadReportID ?? '');
    const options = useMemo(
        () =>
            compareResult.change.billable.map((billable) => ({
                text: billable ? 'Yes' : 'No',
                value: billable,
            })),
        [compareResult.change.billable],
    );
    return (
        <ScreenWrapper testID={ReviewBillable.displayName}>
            <HeaderWithBackButton title="Review duplicates" />
            <ReviewFields
                stepNames={stepNames}
                label="Choose if transaction is billable"
                options={options}
                index={currentScreenIndex}
                onSelectRow={navigateToNextScreen}
            />
        </ScreenWrapper>
    );
}

ReviewBillable.displayName = 'ReviewBillable';
export default ReviewBillable;
