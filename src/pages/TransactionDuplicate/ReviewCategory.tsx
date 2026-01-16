import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReviewDuplicatesNavigation from '@hooks/useReviewDuplicatesNavigation';
import useTransactionsByID from '@hooks/useTransactionsByID';
import {setReviewDuplicatesKey} from '@libs/actions/Transaction';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import {compareDuplicateTransactionFields, getTransactionID} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {FieldItemType} from './ReviewFields';
import ReviewFields from './ReviewFields';

function ReviewCategory() {
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.CATEGORY>>();
    const {translate} = useLocalize();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.threadReportID}`, {canBeMissing: true});
    const transactionID = getTransactionID(report);
    const [reviewDuplicates] = useOnyx(ONYXKEYS.REVIEW_DUPLICATES, {canBeMissing: true});
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`, {canBeMissing: true});
    const [transactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, {
        canBeMissing: false,
    });
    const allDuplicateIDs = useMemo(
        () => transactionViolations?.find((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)?.data?.duplicates ?? [],
        [transactionViolations],
    );
    const [allDuplicates] = useTransactionsByID(allDuplicateIDs);
    const [reviewDuplicatesReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reviewDuplicates?.reportID)}`, {canBeMissing: true});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(reviewDuplicatesReport?.policyID)}`, {canBeMissing: true});

    const compareResult = compareDuplicateTransactionFields(transaction, allDuplicates, reviewDuplicatesReport, undefined, policyCategories);
    const stepNames = Object.keys(compareResult.change ?? {}).map((key, index) => (index + 1).toString());
    const {currentScreenIndex, goBack, navigateToNextScreen} = useReviewDuplicatesNavigation(
        Object.keys(compareResult.change ?? {}),
        'category',
        route.params.threadReportID,
        route.params.backTo,
    );
    const options = useMemo(
        () =>
            compareResult.change.category?.map((category) =>
                !category
                    ? {text: translate('violations.none'), value: ''}
                    : {
                          text: getDecodedCategoryName(category),
                          value: category,
                      },
            ),
        [compareResult.change.category, translate],
    );

    const setCategory = (data: FieldItemType<'category'>) => {
        if (data.value !== undefined) {
            setReviewDuplicatesKey({category: data.value});
        }
        navigateToNextScreen();
    };

    return (
        <ScreenWrapper testID="ReviewCategory">
            <HeaderWithBackButton
                title={translate('iou.reviewDuplicates')}
                onBackButtonPress={goBack}
            />
            <ReviewFields<'category'>
                stepNames={stepNames}
                label={translate('violations.categoryToKeep')}
                options={options}
                index={currentScreenIndex}
                onSelectRow={setCategory}
            />
        </ScreenWrapper>
    );
}

export default ReviewCategory;
