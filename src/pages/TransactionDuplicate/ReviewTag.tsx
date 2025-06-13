import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useTransactionFieldNavigation from '@hooks/useTransactionFieldNavigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import type SCREENS from '@src/SCREENS';
import duplicateReviewConfig from './duplicateReviewConfig';
import mergeTransactionConfig from './mergeTransactionConfig';
import type {FieldItemType} from './ReviewFields';
import ReviewFields from './ReviewFields';

function ReviewTag() {
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.TAG>>();
    const {translate} = useLocalize();
    const transactionID = TransactionUtils.getTransactionID(route.params.threadReportID ?? '');

    const isMerge = route.path?.includes('merge');
    const config = isMerge ? mergeTransactionConfig : duplicateReviewConfig;
    const [reviewDuplicates] = useOnyx(config.onyxKey, {canBeMissing: true});
    const compareResult = config.compareFields(transactionID, reviewDuplicates?.reportID ?? '-1');
    const stepNames = Object.keys(compareResult.change ?? {}).map((_, index) => (index + 1).toString());
    const {currentScreenIndex, goBack, navigateToNextScreen} = useTransactionFieldNavigation(
        Object.keys(compareResult.change ?? {}),
        'tag',
        route.params.threadReportID ?? '',
        config.routes,
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
            config.setFieldAction({tag: data.value});
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
