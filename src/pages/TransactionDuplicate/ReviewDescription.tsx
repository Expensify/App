import type {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useReviewDuplicatesNavigation from '@hooks/useReviewDuplicatesNavigation';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import * as TransactionUtils from '@libs/TransactionUtils';
import type SCREENS from '@src/SCREENS';
import ReviewFields from './ReviewFields';

function ReviewDescription() {
    const route = useRoute<RouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.DESCRIPTION>>();
    const transactionID = TransactionUtils.getTransactionID(route.params.threadReportID ?? '');
    const compareResult = TransactionUtils.compareDuplicateTransactionFields(transactionID);
    const stepNames = Object.keys(compareResult.change ?? {}).map((key, index) => (index + 1).toString());
    const {currentScreenIndex, navigateToNextScreen} = useReviewDuplicatesNavigation(Object.keys(compareResult.change ?? {}), 'description', route.params.threadReportID ?? '');

    return (
        <ScreenWrapper testID={ReviewDescription.displayName}>
            <HeaderWithBackButton title="Review duplicates" />
            <ReviewFields
                stepNames={stepNames}
                label="Choose which description to keep"
                options={compareResult.change.description}
                index={currentScreenIndex + 1}
                onSelectRow={navigateToNextScreen}
            />
        </ScreenWrapper>
    );
}

ReviewDescription.displayName = 'ReviewDescription';
export default ReviewDescription;
