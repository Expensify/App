import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useReviewDuplicatesNavigation from '@hooks/useReviewDuplicatesNavigation';
import {setReviewDuplicatesKey} from '@libs/actions/Transaction';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import * as TransactionUtils from '@libs/TransactionUtils';
import type SCREENS from '@src/SCREENS';
import type {FieldItemType} from './ReviewFields';
import ReviewFields from './ReviewFields';

function ReviewDescription() {
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.DESCRIPTION>>();
    const {translate} = useLocalize();
    const transactionID = TransactionUtils.getTransactionID(route.params.threadReportID ?? '');
    const compareResult = TransactionUtils.compareDuplicateTransactionFields(transactionID);
    const stepNames = Object.keys(compareResult.change ?? {}).map((key, index) => (index + 1).toString());
    const {currentScreenIndex, goBack, navigateToNextScreen} = useReviewDuplicatesNavigation(
        Object.keys(compareResult.change ?? {}),
        'description',
        route.params.threadReportID ?? '',
        route.params.backTo,
    );
    const options = useMemo(
        () =>
            compareResult.change.description?.map((description) =>
                !description?.comment
                    ? {text: translate('violations.none'), value: ''}
                    : {
                          text: description.comment,
                          value: description.comment,
                      },
            ),
        [compareResult.change.description, translate],
    );
    const setDescription = (data: FieldItemType<'description'>) => {
        if (data.value !== undefined) {
            setReviewDuplicatesKey({description: data.value});
        }
        navigateToNextScreen();
    };

    return (
        <ScreenWrapper testID={ReviewDescription.displayName}>
            <HeaderWithBackButton
                title={translate('iou.reviewDuplicates')}
                onBackButtonPress={goBack}
            />
            <ReviewFields<'description'>
                stepNames={stepNames}
                label={translate('violations.descriptionToKeep')}
                options={options}
                index={currentScreenIndex}
                onSelectRow={setDescription}
            />
        </ScreenWrapper>
    );
}

ReviewDescription.displayName = 'ReviewDescription';

export default ReviewDescription;
