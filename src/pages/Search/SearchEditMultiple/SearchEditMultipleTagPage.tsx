import React, {useCallback, useMemo} from 'react';
import Onyx from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchContext} from '@components/Search/SearchContext';
import TagPicker from '@components/TagPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function SearchEditMultipleTagPage() {
    const {translate} = useLocalize();
    const {selectedTransactions} = useSearchContext();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {canBeMissing: true});

    // Determine policyID based on context
    const policyID = useMemo(() => {
        const transactionValues = Object.values(selectedTransactions);
        if (transactionValues.length === 0) {
            return activePolicyID;
        }

        const firstPolicyID = transactionValues[0]?.policyID;
        const allSamePolicy = transactionValues.every((t) => t.policyID === firstPolicyID);

        if (allSamePolicy && firstPolicyID) {
            return firstPolicyID;
        }

        return activePolicyID;
    }, [selectedTransactions, activePolicyID]);

    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID ?? '-1'}`, {canBeMissing: true});

    const currentTag = draftTransaction?.tag ?? '';

    // Get the first tag list name
    const tagListName = useMemo(() => {
        if (!policyTags) {
            return '';
        }
        const tagListKeys = Object.keys(policyTags);
        return tagListKeys.length > 0 ? tagListKeys[0] : '';
    }, [policyTags]);

    const saveTag = useCallback((item: Partial<OptionData>) => {
        Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {
            tag: item.searchText,
        });
        Navigation.goBack();
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={SearchEditMultipleTagPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('common.tag')}
                onBackButtonPress={Navigation.goBack}
            />
            <TagPicker
                policyID={policyID ?? undefined}
                selectedTag={currentTag}
                tagListName={tagListName}
                tagListIndex={0}
                onSubmit={saveTag}
            />
        </ScreenWrapper>
    );
}

SearchEditMultipleTagPage.displayName = 'SearchEditMultipleTagPage';

export default SearchEditMultipleTagPage;
