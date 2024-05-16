import type {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {ListItem} from '@components/SelectionList/types';
import useReviewDuplicatesNavigation from '@hooks/useReviewDuplicatesNavigation';
import {setReviewDuplicatesKey} from '@libs/actions/Transaction';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import * as TransactionUtils from '@libs/TransactionUtils';
import type SCREENS from '@src/SCREENS';
import ReviewFields from './ReviewFields';

function ReviewMerchant() {
    const route = useRoute<RouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.TAG>>();
    const transactionID = TransactionUtils.getTransactionID(route.params.threadReportID ?? '');
    const compareResult = TransactionUtils.compareDuplicateTransactionFields(transactionID);
    const stepNames = Object.keys(compareResult.change ?? {}).map((key, index) => (index + 1).toString());
    const {currentScreenIndex, navigateToNextScreen} = useReviewDuplicatesNavigation(Object.keys(compareResult.change ?? {}), 'merchant', route.params.threadReportID ?? '');
    const options = useMemo(
        () =>
            compareResult.change.merchant.map((merchant) =>
                !merchant
                    ? {text: 'None', value: undefined}
                    : {
                          text: merchant,
                          value: merchant,
                      },
            ),
        [compareResult.change.merchant],
    );

    const onSelectRow = (data: ListItem) => {
        if (data.data !== undefined) {
            setReviewDuplicatesKey({merchant: data.data});
        }
        navigateToNextScreen();
    };

    return (
        <ScreenWrapper testID={ReviewMerchant.displayName}>
            <HeaderWithBackButton title="Review duplicates" />
            <ReviewFields
                stepNames={stepNames}
                label="Choose which merchant to keep"
                options={options}
                index={currentScreenIndex}
                onSelectRow={onSelectRow}
            />
        </ScreenWrapper>
    );
}
ReviewMerchant.displayName = 'ReviewMerchant';

export default ReviewMerchant;
