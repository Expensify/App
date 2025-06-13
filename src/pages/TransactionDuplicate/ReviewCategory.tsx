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

function ReviewCategory() {
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.CATEGORY>>();
    const {translate} = useLocalize();
    const transactionID = TransactionUtils.getTransactionID(route.params.threadReportID ?? '');
    const [reviewDuplicates] = useOnyx(duplicateFieldConfig.onyxKey);
    const compareResult = duplicateFieldConfig.comparisonFunction(transactionID, reviewDuplicates?.reportID ?? '-1');
    const stepNames = Object.keys(compareResult.change ?? {}).map((key, index) => (index + 1).toString());
    const {currentScreenIndex, goBack, navigateToNextScreen} = useTransactionFieldNavigation(
        Object.keys(compareResult.change ?? {}),
        'category',
        route.params.threadReportID ?? '',
        duplicateFieldConfig.routes,
        route.params.backTo,
    );
    const options = useMemo(
        () => compareResult.change.category ? fieldOptionGenerators.category(compareResult.change.category, translate) : undefined,
        [compareResult.change.category, translate],
    );

    const setCategory = (data: FieldItemType<'category'>) => {
        if (data.value !== undefined) {
            duplicateFieldConfig.setFieldAction({category: data.value});
        }
        navigateToNextScreen();
    };

    return (
        <ScreenWrapper testID={ReviewCategory.displayName}>
            <HeaderWithBackButton
                title={translate(duplicateFieldConfig.titleTranslationKey)}
                onBackButtonPress={goBack}
            />
            <ReviewFields<'category'>
                stepNames={stepNames}
                label={translate(fieldLabels.category)}
                options={options}
                index={currentScreenIndex}
                onSelectRow={setCategory}
            />
        </ScreenWrapper>
    );
}

ReviewCategory.displayName = 'ReviewCategory';

export default ReviewCategory;
