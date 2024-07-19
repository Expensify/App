import type {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useReviewDuplicatesNavigation from '@hooks/useReviewDuplicatesNavigation';
import {setReviewDuplicatesKey} from '@libs/actions/Transaction';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import * as TransactionUtils from '@libs/TransactionUtils';
import type SCREENS from '@src/SCREENS';
import type {FieldItemType} from './ReviewFields';
import ReviewFields from './ReviewFields';

function ReviewBillable() {
    const route = useRoute<RouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.TAG>>();
    const {translate} = useLocalize();
    const transactionID = TransactionUtils.getTransactionID(route.params.threadReportID ?? '');
    const compareResult = TransactionUtils.compareDuplicateTransactionFields(transactionID);
    const stepNames = Object.keys(compareResult.change ?? {}).map((key, index) => (index + 1).toString());
    const {currentScreenIndex, navigateToNextScreen} = useReviewDuplicatesNavigation(Object.keys(compareResult.change ?? {}), 'billable', route.params.threadReportID ?? '');
    const options = useMemo(
        () =>
            compareResult.change.billable?.map((billable) => ({
                text: billable ? translate('common.yes') : translate('common.no'),
                value: billable ?? false,
            })),
        [compareResult.change.billable, translate],
    );

    const setBillable = (data: FieldItemType<'billable'>) => {
        if (data.value !== undefined) {
            setReviewDuplicatesKey({billable: data.value});
        }
        navigateToNextScreen();
    };

    return (
        <ScreenWrapper testID={ReviewBillable.displayName}>
            <HeaderWithBackButton title={translate('iou.reviewDuplicates')} />
            <ReviewFields<'billable'>
                stepNames={stepNames}
                label={translate('violations.isTransactionBillable')}
                options={options}
                index={currentScreenIndex}
                onSelectRow={setBillable}
            />
        </ScreenWrapper>
    );
}

ReviewBillable.displayName = 'ReviewBillable';

export default ReviewBillable;
