import type {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useReviewDuplicatesNavigation from '@hooks/useReviewDuplicatesNavigation';
import {setReviewDuplicatesKey} from '@libs/actions/Transaction';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import type SCREENS from '@src/SCREENS';
import type {FieldItemType} from './ReviewFields';
import ReviewFields from './ReviewFields';

function ReviewTag() {
    const route = useRoute<RouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.TAG>>();
    const {translate} = useLocalize();
    const transactionID = TransactionUtils.getTransactionID(route.params.threadReportID ?? '');

    const compareResult = TransactionUtils.compareDuplicateTransactionFields(transactionID);
    const stepNames = Object.keys(compareResult.change ?? {}).map((key, index) => (index + 1).toString());
    const {currentScreenIndex, goBack, navigateToNextScreen} = useReviewDuplicatesNavigation(
        Object.keys(compareResult.change ?? {}),
        'tag',
        route.params.threadReportID ?? '',
        route.params.backTo,
    );
    const options = useMemo(
        () =>
            compareResult.change.tag?.map((tag) =>
                !tag
                    ? {text: translate('violations.none'), value: ''}
                    : {
                          text: PolicyUtils.getCleanedTagName(tag),
                          value: tag,
                      },
            ),
        [compareResult.change.tag, translate],
    );
    const setTag = (data: FieldItemType<'tag'>) => {
        if (data.value !== undefined) {
            setReviewDuplicatesKey({tag: data.value});
        }
        navigateToNextScreen();
    };

    return (
        <ScreenWrapper testID={ReviewTag.displayName}>
            <HeaderWithBackButton
                title={translate('iou.reviewDuplicates')}
                onBackButtonPress={goBack}
            />
            <ReviewFields<'tag'>
                stepNames={stepNames}
                label={translate('violations.tagToKeep')}
                options={options}
                index={currentScreenIndex}
                onSelectRow={setTag}
            />
        </ScreenWrapper>
    );
}

ReviewTag.displayName = 'ReviewTag';

export default ReviewTag;
