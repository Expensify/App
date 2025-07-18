import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReviewDuplicatesNavigation from '@hooks/useReviewDuplicatesNavigation';
import {setReviewDuplicatesKey} from '@libs/actions/Transaction';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import {compareDuplicateTransactionFields, getTransactionID} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {FieldItemType} from './ReviewFields';
import ReviewFields from './ReviewFields';

function ReviewMerchant() {
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.TAG>>();
    const {translate} = useLocalize();
    const transactionID = getTransactionID(route.params.threadReportID);
    const [reviewDuplicates] = useOnyx(ONYXKEYS.REVIEW_DUPLICATES, {canBeMissing: true});
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
        'merchant',
        route.params.threadReportID,
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
