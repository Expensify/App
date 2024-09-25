import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
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

function ReviewMerchant() {
    const route = useRoutePlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.TAG>>();
    const {translate} = useLocalize();
    const transactionID = TransactionUtils.getTransactionID(route.params.threadReportID ?? '');
    const compareResult = TransactionUtils.compareDuplicateTransactionFields(transactionID);
    const stepNames = Object.keys(compareResult.change ?? {}).map((key, index) => (index + 1).toString());
    const {currentScreenIndex, goBack, navigateToNextScreen} = useReviewDuplicatesNavigation(
        Object.keys(compareResult.change ?? {}),
        'merchant',
        route.params.threadReportID ?? '',
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
            setReviewDuplicatesKey({merchant: data.value});
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
