import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReviewDuplicatesNavigation from '@hooks/useReviewDuplicatesNavigation';
import useTransactionsByID from '@hooks/useTransactionsByID';
import {setReviewDuplicatesKey} from '@libs/actions/Transaction';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import {getCleanedTagName} from '@libs/PolicyUtils';
import {compareDuplicateTransactionFields, getTransactionID} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {FieldItemType} from './ReviewFields';
import ReviewFields from './ReviewFields';

function ReviewTag() {
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.TAG>>();
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
        'tag',
        route.params.threadReportID,
        route.params.backTo,
    );
    const options = useMemo(
        () =>
            compareResult.change.tag?.map((tag) =>
                !tag
                    ? {text: translate('violations.none'), value: ''}
                    : {
                          text: getCleanedTagName(tag),
                          value: tag,
                      },
            ),
        [compareResult.change.tag, translate],
    );
    const setTag = (data: FieldItemType<'tag'>) => {
        if (data.value !== undefined) {
            setReviewDuplicatesKey({tag: data.value});
        }
        navigateToNextScreen();
    };

    return (
        <ScreenWrapper testID="ReviewTag">
            <HeaderWithBackButton
                title={translate('iou.reviewDuplicates')}
                onBackButtonPress={goBack}
            />
            <ReviewFields<'tag'>
                stepNames={stepNames}
                label={translate('violations.tagToKeep')}
                options={options}
                index={currentScreenIndex}
                onSelectRow={setTag}
            />
        </ScreenWrapper>
    );
}

export default ReviewTag;
