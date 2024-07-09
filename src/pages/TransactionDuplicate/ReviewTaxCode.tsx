import type {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useReviewDuplicatesNavigation from '@hooks/useReviewDuplicatesNavigation';
import {setReviewDuplicatesKey} from '@libs/actions/Transaction';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import ReviewDescription from './ReviewDescription';
import type {FieldItemType} from './ReviewFields';
import ReviewFields from './ReviewFields';

function ReviewTaxRate() {
    const route = useRoute<RouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.TAX_CODE>>();
    const {translate} = useLocalize();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.threadReportID}`);
    const policy = PolicyUtils.getPolicy(report?.policyID ?? '');
    const transactionID = TransactionUtils.getTransactionID(route.params.threadReportID ?? '');
    const compareResult = TransactionUtils.compareDuplicateTransactionFields(transactionID);
    const stepNames = Object.keys(compareResult.change ?? {}).map((key, index) => (index + 1).toString());
    const {currentScreenIndex, navigateToNextScreen} = useReviewDuplicatesNavigation(Object.keys(compareResult.change ?? {}), 'taxCode', route.params.threadReportID ?? '');
    const options = useMemo(
        () =>
            compareResult.change.taxCode?.map((taxID) =>
                !taxID
                    ? {text: translate('violations.none'), value: undefined}
                    : {
                          text: PolicyUtils.getTaxByID(policy, taxID)?.name ?? '',
                          value: taxID,
                      },
            ),
        [compareResult.change.taxCode, policy, translate],
    );

    const onSelectRow = (data: FieldItemType) => {
        if (data.value !== undefined) {
            setReviewDuplicatesKey({taxCode: data.value as string});
        }
        navigateToNextScreen();
    };

    return (
        <ScreenWrapper testID={ReviewDescription.displayName}>
            <HeaderWithBackButton title={translate('iou.reviewDuplicates')} />
            <ReviewFields
                stepNames={stepNames}
                label={translate('violations.taxCodeToKeep')}
                options={options}
                index={currentScreenIndex}
                onSelectRow={onSelectRow}
            />
        </ScreenWrapper>
    );
}

ReviewTaxRate.displayName = 'ReviewTaxRate';

export default ReviewTaxRate;
