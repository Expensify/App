import type {Filter, SearchFilterCommonProps} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchTagFilters from '@hooks/useSearchTagFilters';

import {getCleanedTagName} from '@libs/PolicyUtils';
import {getAllPolicyValues} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection} from 'react-native-onyx';

import React from 'react';

import type {MultiSelectItem} from './MultiSelect';

import MultiSelect from './MultiSelect';

type TagSelectorProps = SearchFilterCommonProps<string[] | undefined> & {
    policyID: Filter | undefined;
};

function TagSelector({value = [], policyID, selectionListTextInputStyle, selectionListStyle, autoFocus, footer, onChange}: TagSelectorProps) {
    const {translate} = useLocalize();
    const [policies = getEmptyObject<NonNullable<OnyxCollection<Policy>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const policyIDs = policyID?.value?.length
        ? getAllPolicyValues(policyID, ONYXKEYS.COLLECTION.POLICY, policies)
              .map((policy) => policy.id)
              .join(',')
        : '';
    const {searchResults, isSearching, isLoadingMore, hasMore, loadMore, searchTags, isInitialLoading, searchQuery} = useSearchTagFilters(policyIDs);

    const tagItems: Array<MultiSelectItem<string>> = [];
    const emptyTagItem = {text: translate('search.noTag'), value: CONST.SEARCH.TAG_EMPTY_VALUE as string};
    const seenTagNames = new Set<string>();
    const lowerSearchQuery = searchQuery.toLowerCase();

    // Preserve backend order - new items append at end for infinite scroll.
    // When offline the API is skipped, so cached results are filtered locally by the search query.
    for (const policyTags of Object.values(searchResults ?? {})) {
        for (const tag of Object.values(policyTags ?? {})) {
            if (seenTagNames.has(tag.tagName)) {
                continue;
            }
            if (lowerSearchQuery && !tag.tagName.toLowerCase().includes(lowerSearchQuery)) {
                continue;
            }
            seenTagNames.add(tag.tagName);
            tagItems.push({text: getCleanedTagName(tag.tagName), value: tag.tagName});
        }
    }

    const shouldShowEmptyTagOption =
        !isSearching &&
        !isInitialLoading &&
        (!hasMore || seenTagNames.size <= CONST.SEARCH.TAG_FILTER_PAGE_SIZE) &&
        (!searchQuery || emptyTagItem.text.toLowerCase().includes(lowerSearchQuery));

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
    // Gated on !isSearching so stale results during a fetch don't cause selected tags to be appended in the wrong order.
    if (!searchQuery && !isSearching) {
        const itemValues = new Set(tagItems.map((item) => item.value));
        for (const selectedItem of selectedTagsItems) {
            if (!itemValues.has(selectedItem.value)) {
                tagItems.push(selectedItem);
            }
        }
    }

    // Keep search mounted while a query is active or in flight. Clearing results for a new search resets hasMore and tag count.
    const shouldEnableSearch = hasMore || seenTagNames.size >= CONST.STANDARD_LIST_ITEM_LIMIT || isSearching || !!searchQuery;

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
            onEndReached={hasMore ? loadMore : undefined}
            onSearchChange={searchTags}
            loading={isInitialLoading}
            isSearching={isSearching}
            isLoadingMore={isLoadingMore}
        />
    );
}

export default TagSelector;
