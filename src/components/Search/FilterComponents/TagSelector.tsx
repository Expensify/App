import React from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getCleanedTagName, getTagNamesFromTagsLists} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import passthroughPolicyTagListSelector from '@src/selectors/PolicyTagList';
import {filterPolicyIDSelector} from '@src/selectors/Search';
import type {PolicyTagLists} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import MultiSelect from './MultiSelect';

type TagSelectorProps = {
    value: string[] | undefined;
    onChange: (tags: string[]) => void;
};

function TagSelector({value = [], onChange}: TagSelectorProps) {
    const {translate} = useLocalize();
    const [policyIDs = getEmptyArray<string>()] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: filterPolicyIDSelector});
    const [allPolicyTagLists = getEmptyObject<NonNullable<OnyxCollection<PolicyTagLists>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: passthroughPolicyTagListSelector});

    const selectedPoliciesTagLists = Object.keys(allPolicyTagLists ?? {})
        .filter((key) => policyIDs.map((policyID) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`)?.includes(key))
        ?.map((key) => getTagNamesFromTagsLists(allPolicyTagLists?.[key] ?? {}))
        .flat();

    const tagItems = [{text: translate('search.noTag'), value: CONST.SEARCH.TAG_EMPTY_VALUE as string}];
    const uniqueTagNames = new Set<string>();
    if (policyIDs.length === 0) {
        const tagListsUnpacked = Object.values(allPolicyTagLists ?? {}).filter((item) => !!item);
        for (const tag of tagListsUnpacked.map(getTagNamesFromTagsLists).flat()) {
            uniqueTagNames.add(tag);
        }
    } else if (selectedPoliciesTagLists.length > 0) {
        for (const tag of selectedPoliciesTagLists) {
            uniqueTagNames.add(tag);
        }
    }
    tagItems.push(...Array.from(uniqueTagNames).map((tagName) => ({text: getCleanedTagName(tagName), value: tagName})));

    const selectedTagsItems = value.map((tag) => {
        if (tag === CONST.SEARCH.TAG_EMPTY_VALUE) {
            return {text: translate('search.noTag'), value: tag};
        }
        return {text: getCleanedTagName(tag), value: tag};
    });

    return (
        <MultiSelect
            value={selectedTagsItems}
            items={tagItems}
            isSearchable={tagItems.length >= CONST.STANDARD_LIST_ITEM_LIMIT}
            onChange={(tags) => onChange(tags.map((tag) => tag.value))}
        />
    );
}

export default TagSelector;
