import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useReviewDuplicatesNavigation from '@hooks/useReviewDuplicatesNavigation';
import {setReviewDuplicatesKey} from '@libs/actions/Transaction';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import {getPolicy, getTaxByID} from '@libs/PolicyUtils';
import {calculateTaxAmount, compareDuplicateTransactionFields, getAmount, getDefaultTaxCode, getTaxValue, getTransaction, getTransactionID} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import ReviewDescription from './ReviewDescription';
import type {FieldItemType} from './ReviewFields';
import ReviewFields from './ReviewFields';

function ReviewTaxRate() {
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.TAX_CODE>>();
    const {translate} = useLocalize();
    const [reviewDuplicates] = useOnyx(ONYXKEYS.REVIEW_DUPLICATES, {canBeMissing: true});
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reviewDuplicates?.reportID ?? route.params.threadReportID}`, {canBeMissing: true});
    const policy = getPolicy(report?.policyID);
    const transactionID = getTransactionID(route.params.threadReportID);
    const compareResult = compareDuplicateTransactionFields(transactionID, reviewDuplicates?.reportID);
    const stepNames = Object.keys(compareResult.change ?? {}).map((key, index) => (index + 1).toString());
    const {currentScreenIndex, goBack, navigateToNextScreen} = useReviewDuplicatesNavigation(
        Object.keys(compareResult.change ?? {}),
        'taxCode',
        route.params.threadReportID,
        route.params.backTo,
        route.params.isFromExpense,
    );
    // Will be handled in this PR https://github.com/Expensify/App/pull/62434
    // eslint-disable-next-line deprecation/deprecation
    const transaction = getTransaction(transactionID);
    const options = useMemo(
        () =>
            compareResult.change.taxCode?.map((taxID) =>
                !taxID
                    ? {text: translate('violations.none'), value: getDefaultTaxCode(policy, transaction) ?? ''}
                    : {
                          text: getTaxByID(policy, taxID)?.name ?? '',
                          value: taxID,
                      },
            ),
        [compareResult.change.taxCode, policy, transaction, translate],
    );
    const getTaxAmount = useCallback(
        (taxID: string) => {
            const taxPercentage = getTaxValue(policy, transaction, taxID);
            return convertToBackendAmount(calculateTaxAmount(taxPercentage ?? '', getAmount(transaction), transaction?.currency ?? ''));
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
