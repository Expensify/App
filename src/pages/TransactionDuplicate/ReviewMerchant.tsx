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
import type {FieldItemType} from './ReviewFields';
import ReviewFields from './ReviewFields';
import {duplicateFieldConfig, fieldOptionGenerators, fieldLabels} from './fieldConfigs';

function ReviewMerchant() {
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.TAG>>();
    const {translate} = useLocalize();
    const transactionID = TransactionUtils.getTransactionID(route.params.threadReportID ?? '');
    const [reviewDuplicates] = useOnyx(duplicateFieldConfig.onyxKey);
    const compareResult = duplicateFieldConfig.comparisonFunction(transactionID, reviewDuplicates?.reportID ?? '-1');
    const stepNames = Object.keys(compareResult.change ?? {}).map((key, index) => (index + 1).toString());
    const {currentScreenIndex, goBack, navigateToNextScreen} = useTransactionFieldNavigation(
        Object.keys(compareResult.change ?? {}),
        'merchant',
        route.params.threadReportID ?? '',
        duplicateFieldConfig.routes,
        route.params.backTo,
    );
    const options = useMemo(
        () => compareResult.change.merchant ? fieldOptionGenerators.merchant(compareResult.change.merchant, translate) : undefined,
        [compareResult.change.merchant, translate],
    );

    const setMerchant = (data: FieldItemType<'merchant'>) => {
        if (data.value !== undefined) {
            duplicateFieldConfig.setFieldAction({merchant: data.value});
        }
        navigateToNextScreen();
    };

    return (
        <ScreenWrapper testID={ReviewMerchant.displayName}>
            <HeaderWithBackButton
                title={translate(duplicateFieldConfig.titleTranslationKey)}
                onBackButtonPress={goBack}
            />
            <ReviewFields<'merchant'>
                stepNames={stepNames}
                label={translate(fieldLabels.merchant)}
                options={options}
                index={currentScreenIndex}
                onSelectRow={setMerchant}
            />
        </ScreenWrapper>
    );
}

ReviewMerchant.displayName = 'ReviewMerchant';

export default ReviewMerchant;
