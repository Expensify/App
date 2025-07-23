import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReviewDuplicatesNavigation from '@hooks/useReviewDuplicatesNavigation';
import {setReviewDuplicatesKey} from '@libs/actions/Transaction';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import {compareDuplicateTransactionFields, getTransactionID} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {FieldItemType} from './ReviewFields';
import ReviewFields from './ReviewFields';

function ReviewReimbursable() {
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.TAG>>();
    const {translate} = useLocalize();
    const transactionID = getTransactionID(route.params.threadReportID);
    const [reviewDuplicates] = useOnyx(ONYXKEYS.REVIEW_DUPLICATES, {canBeMissing: true});
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`, {canBeMissing: true});
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
        'reimbursable',
        route.params.threadReportID,
        route.params.backTo,
    );
    const options = useMemo(
        () =>
            compareResult.change.reimbursable?.map((reimbursable) => ({
                text: reimbursable ? translate('common.yes') : translate('common.no'),
                value: reimbursable ?? false,
            })),
        [compareResult.change.reimbursable, translate],
    );

    const setReimbursable = (data: FieldItemType<'reimbursable'>) => {
        if (data.value !== undefined) {
            setReviewDuplicatesKey({reimbursable: data.value});
        }
        navigateToNextScreen();
    };

    return (
        <ScreenWrapper testID={ReviewReimbursable.displayName}>
            <HeaderWithBackButton
                title={translate('iou.reviewDuplicates')}
                onBackButtonPress={goBack}
            />
            <ReviewFields<'reimbursable'>
                stepNames={stepNames}
                label={translate('violations.isTransactionReimbursable')}
                options={options}
                index={currentScreenIndex}
                onSelectRow={setReimbursable}
            />
        </ScreenWrapper>
    );
}

ReviewReimbursable.displayName = 'ReviewReimbursable';

export default ReviewReimbursable;
