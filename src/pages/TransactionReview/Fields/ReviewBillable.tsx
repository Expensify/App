import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useTransactionFieldNavigation from '@hooks/useTransactionFieldNavigation';
import {setReviewDuplicatesKey} from '@libs/actions/Transaction';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import * as TransactionUtils from '@libs/TransactionUtils';
import type SCREENS from '@src/SCREENS';
import duplicateReviewConfig from '../Duplicates/duplicateReviewConfig';
import mergeTransactionConfig from '../Merge/mergeTransactionConfig';
import type {FieldItemType} from './ReviewFields';
import ReviewFields from './ReviewFields';

function ReviewBillable() {
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
        'billable',
        route.params.threadReportID ?? '',
        config.routes,
        route.params.backTo,
    );
    const options = useMemo(
        () =>
            compareResult.change.billable?.map((billable) => ({
                text: billable ? translate('common.yes') : translate('common.no'),
                value: billable ?? false,
            })),
        [compareResult.change.billable, translate],
    );

    const setBillable = (data: FieldItemType<'billable'>) => {
        if (data.value !== undefined) {
            setReviewDuplicatesKey({billable: data.value});
        }
        navigateToNextScreen();
    };

    return (
        <ScreenWrapper testID={ReviewBillable.displayName}>
            <HeaderWithBackButton
                title={translate('iou.reviewDuplicates')}
                onBackButtonPress={goBack}
            />
            <ReviewFields<'billable'>
                stepNames={stepNames}
                label={translate('violations.isTransactionBillable')}
                options={options}
                index={currentScreenIndex}
                onSelectRow={setBillable}
            />
        </ScreenWrapper>
    );
}

ReviewBillable.displayName = 'ReviewBillable';

export default ReviewBillable;
