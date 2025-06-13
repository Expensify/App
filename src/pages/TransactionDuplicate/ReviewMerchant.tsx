import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useTransactionFieldNavigation from '@hooks/useTransactionFieldNavigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import * as TransactionUtils from '@libs/TransactionUtils';
import type SCREENS from '@src/SCREENS';
import duplicateReviewConfig from './duplicateReviewConfig';
import mergeTransactionConfig from './mergeTransactionConfig';
import type {FieldItemType} from './ReviewFields';
import ReviewFields from './ReviewFields';

function ReviewMerchant() {
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.TAG>>();
    const isMerge = route.path?.includes('merge');
    const config = isMerge ? mergeTransactionConfig : duplicateReviewConfig;
    const {translate} = useLocalize();
    const transactionID = TransactionUtils.getTransactionID(route.params.threadReportID ?? '');
    const [reviewDuplicates] = useOnyx(config.onyxKey, {canBeMissing: true});
    const compareResult = TransactionUtils.compareDuplicateTransactionFields(transactionID, reviewDuplicates?.reportID ?? '-1');
    const stepNames = Object.keys(compareResult.change ?? {}).map((_, index) => (index + 1).toString());
    const {currentScreenIndex, goBack, navigateToNextScreen} = useTransactionFieldNavigation(
        Object.keys(compareResult.change ?? {}),
        'merchant',
        route.params.threadReportID ?? '',
        config.routes,
        route.params.backTo,
    );
    const options = useMemo(
        () =>
            compareResult.change.merchant?.map((merchant) =>
                !merchant
                    ? {text: translate('violations.none'), value: ''}
                    : {
                          text: merchant,
                          value: merchant,
                      },
            ),
        [compareResult.change.merchant, translate],
    );

    const setMerchant = (data: FieldItemType<'merchant'>) => {
        if (data.value !== undefined) {
            config.setFieldAction({merchant: data.value});
        }
        navigateToNextScreen();
    };

    return (
        <ScreenWrapper testID={ReviewMerchant.displayName}>
            <HeaderWithBackButton
                title={translate('iou.reviewDuplicates')}
                onBackButtonPress={goBack}
            />
            <ReviewFields<'merchant'>
                stepNames={stepNames}
                label={translate('violations.merchantToKeep')}
                options={options}
                index={currentScreenIndex}
                onSelectRow={setMerchant}
            />
        </ScreenWrapper>
    );
}

ReviewMerchant.displayName = 'ReviewMerchant';

export default ReviewMerchant;
