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

function ReviewCategory() {
    const route = useRoute<RouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.CATEGORY>>();
    const {translate} = useLocalize();
    const transactionID = TransactionUtils.getTransactionID(route.params.threadReportID ?? '');
    const compareResult = TransactionUtils.compareDuplicateTransactionFields(transactionID);
    const stepNames = Object.keys(compareResult.change ?? {}).map((key, index) => (index + 1).toString());
    const {currentScreenIndex, navigateToNextScreen} = useReviewDuplicatesNavigation(Object.keys(compareResult.change ?? {}), 'category', route.params.threadReportID ?? '');
    const options = useMemo(
        () =>
            compareResult.change.category?.map((category) =>
                !category
                    ? {text: translate('violations.none'), value: undefined}
                    : {
                          text: category,
                          value: category,
                      },
            ),
        [compareResult.change.category, translate],
    );

    const onSelectRow = (data: FieldItemType) => {
        if (data.value !== undefined) {
            setReviewDuplicatesKey({category: data.value as string});
        }
        navigateToNextScreen();
    };

    return (
        <ScreenWrapper testID={ReviewCategory.displayName}>
            <HeaderWithBackButton title={translate('iou.reviewDuplicates')} />
            <ReviewFields
                stepNames={stepNames}
                label={translate('violations.categoryToKeep')}
                options={options}
                index={currentScreenIndex}
                onSelectRow={onSelectRow}
            />
        </ScreenWrapper>
    );
}

ReviewCategory.displayName = 'ReviewCategory';

export default ReviewCategory;
