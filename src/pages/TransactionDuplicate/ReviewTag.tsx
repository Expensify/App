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

function ReviewTag() {
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.TAG>>();
    const {translate} = useLocalize();
    const transactionID = TransactionUtils.getTransactionID(route.params.threadReportID ?? '');

    const [reviewDuplicates] = useOnyx(duplicateFieldConfig.onyxKey);
    const compareResult = duplicateFieldConfig.comparisonFunction(transactionID, reviewDuplicates?.reportID ?? '-1');
    const stepNames = Object.keys(compareResult.change ?? {}).map((key, index) => (index + 1).toString());
    const {currentScreenIndex, goBack, navigateToNextScreen} = useTransactionFieldNavigation(
        Object.keys(compareResult.change ?? {}),
        'tag',
        route.params.threadReportID ?? '',
        duplicateFieldConfig.routes,
        route.params.backTo,
    );
    const options = useMemo(
        () => compareResult.change.tag ? fieldOptionGenerators.tag(compareResult.change.tag, translate) : undefined,
        [compareResult.change.tag, translate],
    );
    const setTag = (data: FieldItemType<'tag'>) => {
        if (data.value !== undefined) {
            duplicateFieldConfig.setFieldAction({tag: data.value});
        }
        navigateToNextScreen();
    };

    return (
        <ScreenWrapper testID={ReviewTag.displayName}>
            <HeaderWithBackButton
                title={translate(duplicateFieldConfig.titleTranslationKey)}
                onBackButtonPress={goBack}
            />
            <ReviewFields<'tag'>
                stepNames={stepNames}
                label={translate(fieldLabels.tag)}
                options={options}
                index={currentScreenIndex}
                onSelectRow={setTag}
            />
        </ScreenWrapper>
    );
}

ReviewTag.displayName = 'ReviewTag';

export default ReviewTag;
