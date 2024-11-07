import type {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useReviewDuplicatesNavigation from '@hooks/useReviewDuplicatesNavigation';
import {setReviewDuplicatesKey} from '@libs/actions/Transaction';
import * as CurrencyUtils from '@libs/CurrencyUtils';
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
    const [reviewDuplicates] = useOnyx(ONYXKEYS.REVIEW_DUPLICATES);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reviewDuplicates?.reportID ?? route.params.threadReportID}`);
    const policy = PolicyUtils.getPolicy(report?.policyID ?? '');
    const transactionID = TransactionUtils.getTransactionID(route.params.threadReportID ?? '');
    const compareResult = TransactionUtils.compareDuplicateTransactionFields(transactionID, reviewDuplicates?.reportID ?? '-1');
    const stepNames = Object.keys(compareResult.change ?? {}).map((key, index) => (index + 1).toString());
    const {currentScreenIndex, goBack, navigateToNextScreen} = useReviewDuplicatesNavigation(
        Object.keys(compareResult.change ?? {}),
        'taxCode',
        route.params.threadReportID ?? '',
        route.params.backTo,
    );
    const transaction = TransactionUtils.getTransaction(transactionID);
    const options = useMemo(
        () =>
            compareResult.change.taxCode?.map((taxID) =>
                !taxID
                    ? {text: translate('violations.none'), value: TransactionUtils.getDefaultTaxCode(policy, transaction) ?? ''}
                    : {
                          text: PolicyUtils.getTaxByID(policy, taxID)?.name ?? '',
                          value: taxID,
                      },
            ),
        [compareResult.change.taxCode, policy, transaction, translate],
    );
    const getTaxAmount = useCallback(
        (taxID: string) => {
            const taxPercentage = TransactionUtils.getTaxValue(policy, transaction, taxID);
            return CurrencyUtils.convertToBackendAmount(TransactionUtils.calculateTaxAmount(taxPercentage ?? '', TransactionUtils.getAmount(transaction), transaction?.currency ?? ''));
        },
        [policy, transaction],
    );

    const setTaxCode = useCallback(
        (data: FieldItemType<'taxCode'>) => {
            if (data.value !== undefined) {
                setReviewDuplicatesKey({taxCode: data.value, taxAmount: getTaxAmount(data.value)});
            }
            navigateToNextScreen();
        },
        [getTaxAmount, navigateToNextScreen],
    );

    return (
        <ScreenWrapper testID={ReviewDescription.displayName}>
            <HeaderWithBackButton
                title={translate('iou.reviewDuplicates')}
                onBackButtonPress={goBack}
            />
            <ReviewFields<'taxCode'>
                stepNames={stepNames}
                label={translate('violations.taxCodeToKeep')}
                options={options}
                index={currentScreenIndex}
                onSelectRow={setTaxCode}
            />
        </ScreenWrapper>
    );
}

ReviewTaxRate.displayName = 'ReviewTaxRate';

export default ReviewTaxRate;
