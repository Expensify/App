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

function ReviewReimbursable() {
    const route = useRoute<RouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.TAG>>();
    const {translate} = useLocalize();
    const transactionID = TransactionUtils.getTransactionID(route.params.threadReportID ?? '');
    const compareResult = TransactionUtils.compareDuplicateTransactionFields(transactionID);
    const stepNames = Object.keys(compareResult.change ?? {}).map((key, index) => (index + 1).toString());
    const {currentScreenIndex, navigateToNextScreen} = useReviewDuplicatesNavigation(Object.keys(compareResult.change ?? {}), 'reimbursable', route.params.threadReportID ?? '');
    const options = useMemo(
        () =>
            compareResult.change.reimbursable?.map((reimbursable) => ({
                text: reimbursable ? translate('common.yes') : translate('common.no'),
                value: reimbursable,
            })),
        [compareResult.change.reimbursable, translate],
    );

    const onSelectRow = (data: FieldItemType) => {
        if (data.value !== undefined) {
            setReviewDuplicatesKey({reimbursable: data.value as boolean});
        }
        navigateToNextScreen();
    };

    return (
        <ScreenWrapper testID={ReviewReimbursable.displayName}>
            <HeaderWithBackButton title={translate('iou.reviewDuplicates')} />
            <ReviewFields
                stepNames={stepNames}
                label={translate('violations.isTransactionReimbursable')}
                options={options}
                index={currentScreenIndex}
                onSelectRow={onSelectRow}
            />
        </ScreenWrapper>
    );
}

ReviewReimbursable.displayName = 'ReviewReimbursable';

export default ReviewReimbursable;
