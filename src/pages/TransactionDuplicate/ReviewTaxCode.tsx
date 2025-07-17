import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReviewDuplicatesNavigation from '@hooks/useReviewDuplicatesNavigation';
import {setReviewDuplicatesKey} from '@libs/actions/Transaction';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import {getPolicy, getTaxByID} from '@libs/PolicyUtils';
import {calculateTaxAmount, compareDuplicateTransactionFields, getAmount, getDefaultTaxCode, getTaxValue, getTransactionID} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
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
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    const policy = getPolicy(report?.policyID);
    const transactionID = getTransactionID(route.params.threadReportID);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: true});
    const [transactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, {
        canBeMissing: false,
    });
    const allDuplicateIDs = useMemo(
        () => transactionViolations?.find((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)?.data?.duplicates ?? [],
        [transactionViolations],
    );
    const [allDuplicates] = useOnyx(
        ONYXKEYS.COLLECTION.TRANSACTION,
        {
            selector: (allTransactions) => allDuplicateIDs.map((id) => allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`]),
            canBeMissing: true,
        },
        [allDuplicateIDs],
    );

    const compareResult = compareDuplicateTransactionFields(transaction, allDuplicates, reviewDuplicates?.reportID);
    const stepNames = Object.keys(compareResult.change ?? {}).map((key, index) => (index + 1).toString());
    const {currentScreenIndex, goBack, navigateToNextScreen} = useReviewDuplicatesNavigation(
        Object.keys(compareResult.change ?? {}),
        'taxCode',
        route.params.threadReportID,
        route.params.backTo,
    );

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
