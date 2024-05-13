import type {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useReviewDuplicatesNavigation from '@hooks/useReviewDuplicatesNavigation';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import * as TransactionUtils from '@libs/TransactionUtils';
import type SCREENS from '@src/SCREENS';
import ReviewDescription from './ReviewDescription';
import ReviewFields from './ReviewFields';

function ReviewTaxRate() {
    const route = useRoute<RouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.TAX_CODE>>();
    const transactionID = TransactionUtils.getTransactionID(route.params.threadReportID ?? '');
    const compareResult = TransactionUtils.compareDuplicateTransactionFields(transactionID);
    const stepNames = Object.keys(compareResult.change ?? {}).map((key, index) => (index + 1).toString());
    const {currentScreenIndex, navigateToNextScreen} = useReviewDuplicatesNavigation(Object.keys(compareResult.change ?? {}), 'taxCode', route.params.threadReportID ?? '');
    return (
        <ScreenWrapper testID={ReviewDescription.displayName}>
            <HeaderWithBackButton title="Review duplicates" />
            <ReviewFields
                stepNames={stepNames}
                label="Choose which tax code to keep"
                options={compareResult.change.taxCode}
                index={currentScreenIndex + 1}
                onSelectRow={navigateToNextScreen}
            />
        </ScreenWrapper>
    );
}

export default ReviewTaxRate;
