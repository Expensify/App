import React from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import type {SearchFilterCommonProps} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getCleanedTagName, getTagNamesFromTagsLists} from '@libs/PolicyUtils';
import {sortOptionsWithEmptyValue} from '@libs/SearchQueryUtils';
import type {PolicyIDFilter} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import passthroughPolicyTagListSelector from '@src/selectors/PolicyTagList';
import type {PolicyTagLists} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import MultiSelect from './MultiSelect';

type TagSelectorProps = SearchFilterCommonProps<string[] | undefined> & {
    policyID: PolicyIDFilter;
};

function TagSelector({value = [], policyID, selectionListTextInputStyle, selectionListStyle, autoFocus, footer, onChange}: TagSelectorProps) {
    const {translate, localeCompare} = useLocalize();
    const [allPolicyTagLists = getEmptyObject<NonNullable<OnyxCollection<PolicyTagLists>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: passthroughPolicyTagListSelector});

    const selectedPoliciesTagLists = Object.keys(allPolicyTagLists ?? {})
        .filter((key) => {
            const isSelected = policyID.value?.map((policyID) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`)?.includes(key);
            return policyID.isNegated ? !isSelected : isSelected;
        })
        ?.map((key) => getTagNamesFromTagsLists(allPolicyTagLists?.[key] ?? {}))
        .flat();

    const tagItems = [{text: translate('search.noTag'), value: CONST.SEARCH.TAG_EMPTY_VALUE as string}];
    const uniqueTagNames = new Set<string>();
    if (!policyID.value?.length) {
        const tagListsUnpacked = Object.values(allPolicyTagLists ?? {}).filter((item) => !!item);
        for (const tag of tagListsUnpacked.map(getTagNamesFromTagsLists).flat()) {
            uniqueTagNames.add(tag);
        }
    } else if (selectedPoliciesTagLists.length > 0) {
        for (const tag of selectedPoliciesTagLists) {
            uniqueTagNames.add(tag);
        }
    }
    tagItems.push(
        ...Array.from(uniqueTagNames)
            .map((tagName) => ({text: getCleanedTagName(tagName), value: tagName}))
            .toSorted((a, b) => sortOptionsWithEmptyValue(a.text.toString(), b.text.toString(), localeCompare)),
    );

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
            autoFocus={autoFocus}
            selectionListTextInputStyle={selectionListTextInputStyle}
            selectionListStyle={selectionListStyle}
            footer={footer}
            onChange={(tags) => onChange(tags.map((tag) => tag.value))}
        />
    );
}

export default TagSelector;
