import type {Filter, SearchFilterCommonProps} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useSearchTagFilters from '@hooks/useSearchTagFilters';

import {getCleanedTagName} from '@libs/PolicyUtils';

import CONST from '@src/CONST';

import React from 'react';

import type {MultiSelectItem} from './MultiSelect';

import MultiSelect from './MultiSelect';

type TagSelectorProps = SearchFilterCommonProps<string[] | undefined> & {
    policyID: Filter | undefined;
};

function TagSelector({value = [], policyID, selectionListTextInputStyle, selectionListStyle, autoFocus, footer, onChange}: TagSelectorProps) {
    const {translate} = useLocalize();
    // A negated workspace filter cannot be expressed as an inclusion list, so it falls back to searching every workspace
    const policyIDs = policyID?.isNegated ? '' : (policyID?.value ?? []).join(',');
    const {searchResults, isLoading, hasMore, loadMore, searchTags, isInitialLoading, searchQuery} = useSearchTagFilters(policyIDs);

    const tagItems: Array<MultiSelectItem<string>> = [];
    const emptyTagItem = {text: translate('search.noTag'), value: CONST.SEARCH.TAG_EMPTY_VALUE as string};
    // The empty-tag option is client-side only, so it is matched against the applied search query locally
    if (!searchQuery || emptyTagItem.text.toLowerCase().includes(searchQuery.toLowerCase())) {
        tagItems.push(emptyTagItem);
    }
    const seenTagNames = new Set<string>();

    // Preserve backend order - new items append at end for infinite scroll
    for (const policyTags of Object.values(searchResults ?? {})) {
        for (const tag of Object.values(policyTags ?? {})) {
            if (seenTagNames.has(tag.tagName)) {
                continue;
            }
            seenTagNames.add(tag.tagName);
            tagItems.push({text: getCleanedTagName(tag.tagName), value: tag.tagName});
        }
    }

    const selectedTagsItems = value.map((tag) => {
        if (tag === CONST.SEARCH.TAG_EMPTY_VALUE) {
            return {text: translate('search.noTag'), value: tag};
        }
        return {text: getCleanedTagName(tag), value: tag};
    });

    // Selected tags that are not in the current result page stay visible once the search is cleared, so the selection doesn't disappear from the list.
    // Gated on !isLoading so stale results during a fetch don't cause selected tags to be appended in the wrong order.
    if (!searchQuery && !isLoading) {
        const itemValues = new Set(tagItems.map((item) => item.value));
        for (const selectedItem of selectedTagsItems) {
            if (!itemValues.has(selectedItem.value)) {
                tagItems.push(selectedItem);
            }
        }
    }

    return (
        <MultiSelect
            value={selectedTagsItems}
            items={tagItems}
            isSearchable
            autoFocus={autoFocus}
            selectionListTextInputStyle={selectionListTextInputStyle}
            selectionListStyle={selectionListStyle}
            footer={footer}
            onChange={(tags) => onChange(tags.map((tag) => tag.value))}
            onEndReached={hasMore ? loadMore : undefined}
            onSearchChange={searchTags}
            loading={isInitialLoading}
            isLoading={isLoading}
            isLoadingMore={isLoading && tagItems.length > 1}
        />
    );
}

export default TagSelector;
