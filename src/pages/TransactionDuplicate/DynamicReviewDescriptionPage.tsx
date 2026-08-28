import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReviewDuplicatesNavigation from '@hooks/useReviewDuplicatesNavigation';
import useTransactionsByID from '@hooks/useTransactionsByID';

import {setReviewDuplicatesKey} from '@libs/actions/Transaction';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import Parser from '@libs/Parser';
import StringUtils from '@libs/StringUtils';
import {compareDuplicateTransactionFields, getTransactionID} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';

import type {FieldItemType} from './ReviewFields';

import ReviewFields from './ReviewFields';

function DynamicReviewDescriptionPage() {
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.DYNAMIC_DESCRIPTION>>();
    const {translate} = useLocalize();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_DESCRIPTION.path);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`);
    const transactionID = getTransactionID(report);
    const [reviewDuplicates] = useOnyx(ONYXKEYS.REVIEW_DUPLICATES);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`);
    const [transactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
    const allDuplicateIDs = useMemo(
        () => transactionViolations?.find((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)?.data?.duplicates ?? [],
        [transactionViolations],
    );
    const [allDuplicates] = useTransactionsByID(allDuplicateIDs);
    const [reviewDuplicatesReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reviewDuplicates?.reportID)}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(reviewDuplicatesReport?.policyID)}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(reviewDuplicatesReport?.policyID)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(reviewDuplicatesReport?.policyID)}`);

    const compareResult = compareDuplicateTransactionFields(policyTags ?? {}, transaction, allDuplicates, reviewDuplicatesReport, reviewDuplicates?.transactionID, policy, policyCategories);
    const stepNames = Object.keys(compareResult.change ?? {}).map((key, index) => (index + 1).toString());
    const {currentScreenIndex, navigateToNextScreen} = useReviewDuplicatesNavigation(Object.keys(compareResult.change ?? {}), 'description', route.params.reportID, route.params.backTo);
    const options = useMemo(
        () =>
            compareResult.change.description?.map((description) =>
                !description?.comment
                    ? {text: translate('violations.none'), value: ''}
                    : {
                          text: StringUtils.lineBreaksToSpaces(Parser.htmlToText(description.comment)),
                          value: description.comment,
                      },
            ),
        [compareResult.change.description, translate],
    );
    const setDescription = (data: FieldItemType<'description'>) => {
        if (data.value !== undefined) {
            setReviewDuplicatesKey({description: data.value});
        }
        navigateToNextScreen();
    };

    return (
        <ScreenWrapper testID="DynamicReviewDescriptionPage">
            <HeaderWithBackButton
                title={translate('iou.reviewDuplicates')}
                onBackButtonPress={() => Navigation.goBack(backPath, {compareParams: false})}
            />
            <ReviewFields<'description'>
                stepNames={stepNames}
                label={translate('violations.descriptionToKeep')}
                options={options}
                index={currentScreenIndex}
                onSelectRow={setDescription}
                selectedValue={reviewDuplicates?.description}
            />
        </ScreenWrapper>
    );
}

export default DynamicReviewDescriptionPage;
