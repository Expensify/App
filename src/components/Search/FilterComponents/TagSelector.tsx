import type {Filter, SearchFilterCommonProps} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSearchTagFilters from '@hooks/useSearchTagFilters';

import {getCleanedTagName, getTagNamesFromTagsLists} from '@libs/PolicyUtils';
import {getAllPolicyValues, sortOptionsWithEmptyValue} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyTagLists} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection} from 'react-native-onyx';

import React from 'react';

import type {MultiSelectItem} from './MultiSelect';

import MultiSelect from './MultiSelect';

type TagSelectorProps = SearchFilterCommonProps<string[] | undefined> & {
    policyID: Filter | undefined;
};

function TagSelector({value = [], policyID, selectionListTextInputStyle, selectionListStyle, autoFocus, footer, onChange}: TagSelectorProps) {
    const {translate, localeCompare} = useLocalize();
    const {isOffline} = useNetwork();
    const [policies = getEmptyObject<NonNullable<OnyxCollection<Policy>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allPolicyTags = getEmptyObject<NonNullable<OnyxCollection<PolicyTagLists>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const policyIDs = policyID?.value?.length
        ? getAllPolicyValues(policyID, ONYXKEYS.COLLECTION.POLICY, policies)
              .map((policy) => policy.id)
              .join(',')
        : '';
    const {searchResults, isSearching, isLoadingMore, hasMore, loadMore, searchTags, isInitialLoading, searchQuery} = useSearchTagFilters(policyIDs);

    const hasSearchResults = !!searchResults && Object.keys(searchResults).length > 0;
    const shouldUseOfflineFallback = isOffline && !hasSearchResults;

    const tagItems: Array<MultiSelectItem<string>> = [];
    const emptyTagItem = {text: translate('search.noTag'), value: CONST.SEARCH.TAG_EMPTY_VALUE as string};
    const seenTagNames = new Set<string>();
    const lowerSearchQuery = searchQuery.toLowerCase();

    const addTagName = (tagName: string) => {
        if (seenTagNames.has(tagName)) {
            return;
        }
        if (lowerSearchQuery && !tagName.toLowerCase().includes(lowerSearchQuery)) {
            return;
        }
        seenTagNames.add(tagName);
        tagItems.push({text: getCleanedTagName(tagName), value: tagName});
    };

    if (shouldUseOfflineFallback) {
        // Fall back to synced workspace tag data when the paginated search cache is empty offline.
        const policyTagsLists = getAllPolicyValues(policyID?.value?.length ? policyID : undefined, ONYXKEYS.COLLECTION.POLICY_TAGS, allPolicyTags);
        for (const policyTagsList of policyTagsLists) {
            for (const tagName of getTagNamesFromTagsLists(policyTagsList)) {
                addTagName(tagName);
            }
        }
    } else {
        // Preserve backend order - new items append at end for infinite scroll.
        // When offline the API is skipped, so cached results are filtered locally by the search query.
        for (const policyTags of Object.values(searchResults ?? {})) {
            for (const tag of Object.values(policyTags ?? {})) {
                addTagName(tag.tagName);
            }
        }
    }

    tagItems.sort((a, b) => sortOptionsWithEmptyValue(a.text.toString(), b.text.toString(), localeCompare));

    const shouldShowEmptyTagOption = !isSearching && !isInitialLoading && (!searchQuery || emptyTagItem.text.toLowerCase().includes(lowerSearchQuery));

    if (shouldShowEmptyTagOption) {
        tagItems.unshift(emptyTagItem);
    }

    const selectedTagsItems = value.map((tag) => {
        if (tag === CONST.SEARCH.TAG_EMPTY_VALUE) {
            return {text: translate('search.noTag'), value: tag};
        }
        return {text: getCleanedTagName(tag), value: tag};
    });

    // Selected tags that are not in the current result page stay visible once the search is cleared, so the selection doesn't disappear from the list.
    // Prepend missing selected items to the top (after "No tag") so they don't land at the bottom of the paginated list.
    // Do not gate on !isSearching so they stay mounted during re-fetches without flashing.
    if (!searchQuery) {
        const itemValues = new Set(tagItems.map((item) => item.value));
        const missingSelectedItems = selectedTagsItems.filter((selectedItem) => !itemValues.has(selectedItem.value)).toSorted((a, b) => localeCompare(a.text.toString(), b.text.toString()));

        if (missingSelectedItems.length > 0) {
            const insertIndex = shouldShowEmptyTagOption ? 1 : 0;
            tagItems.splice(insertIndex, 0, ...missingSelectedItems);
        }
    }

    // Keep search mounted while a query is active or in flight. Clearing results for a new search resets hasMore and tag count.
    const shouldEnableSearch = shouldUseOfflineFallback
        ? seenTagNames.size >= CONST.STANDARD_LIST_ITEM_LIMIT || !!searchQuery
        : hasMore || seenTagNames.size >= CONST.STANDARD_LIST_ITEM_LIMIT || isSearching || !!searchQuery;

    return (
        <MultiSelect
            value={selectedTagsItems}
            items={tagItems}
            isSearchable={shouldEnableSearch}
            autoFocus={autoFocus}
            selectionListTextInputStyle={selectionListTextInputStyle}
            selectionListStyle={selectionListStyle}
            footer={footer}
            onChange={(tags) => onChange(tags.map((tag) => tag.value))}
            onEndReached={hasMore && !shouldUseOfflineFallback ? loadMore : undefined}
            onSearchChange={searchTags}
            loading={isInitialLoading}
            isSearching={isSearching}
            isLoadingMore={isLoadingMore}
        />
    );
}

export default TagSelector;
