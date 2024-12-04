import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useReviewDuplicatesNavigation from '@hooks/useReviewDuplicatesNavigation';
import {setReviewDuplicatesKey} from '@libs/actions/Transaction';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import * as TransactionUtils from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {FieldItemType} from './ReviewFields';
import ReviewFields from './ReviewFields';

function ReviewCategory() {
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.CATEGORY>>();
    const {translate} = useLocalize();
    const transactionID = TransactionUtils.getTransactionID(route.params.threadReportID ?? '');
    const [reviewDuplicates] = useOnyx(ONYXKEYS.REVIEW_DUPLICATES);
    const compareResult = TransactionUtils.compareDuplicateTransactionFields(transactionID, reviewDuplicates?.reportID ?? '-1');
    const stepNames = Object.keys(compareResult.change ?? {}).map((key, index) => (index + 1).toString());
    const {currentScreenIndex, goBack, navigateToNextScreen} = useReviewDuplicatesNavigation(
        Object.keys(compareResult.change ?? {}),
        'category',
        route.params.threadReportID ?? '',
        route.params.backTo,
    );
    const options = useMemo(
        () =>
            compareResult.change.category?.map((category) =>
                !category
                    ? {text: translate('violations.none'), value: ''}
                    : {
                          text: category,
                          value: category,
                      },
            ),
        [compareResult.change.category, translate],
    );

    const setCategory = (data: FieldItemType<'category'>) => {
        if (data.value !== undefined) {
            setReviewDuplicatesKey({category: data.value});
        }
        navigateToNextScreen();
    };

    return (
        <ScreenWrapper testID={ReviewCategory.displayName}>
            <HeaderWithBackButton
                title={translate('iou.reviewDuplicates')}
                onBackButtonPress={goBack}
            />
            <ReviewFields<'category'>
                stepNames={stepNames}
                label={translate('violations.categoryToKeep')}
                options={options}
                index={currentScreenIndex}
                onSelectRow={setCategory}
            />
        </ScreenWrapper>
    );
}

ReviewCategory.displayName = 'ReviewCategory';

export default ReviewCategory;
