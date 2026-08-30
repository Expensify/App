import type {SearchFilterCommonProps} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useSearchTagFilters from '@hooks/useSearchTagFilters';

import {getCleanedTagName} from '@libs/PolicyUtils';

import CONST from '@src/CONST';

import React from 'react';

import MultiSelect from './MultiSelect';

type TagSelectorProps = SearchFilterCommonProps<string[] | undefined>;

function TagSelector({value = [], selectionListTextInputStyle, selectionListStyle, autoFocus, footer, onChange}: TagSelectorProps) {
    const {translate} = useLocalize();
    const {searchResults, isLoading, hasMore, loadMore, search, isInitialLoading} = useSearchTagFilters();

    const tagItems = [{text: translate('search.noTag'), value: CONST.SEARCH.TAG_EMPTY_VALUE as string}];
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
            onSearchChange={search}
            loading={isInitialLoading}
            isLoadingMore={isLoading && tagItems.length > 1}
        />
    );
}

export default TagSelector;
