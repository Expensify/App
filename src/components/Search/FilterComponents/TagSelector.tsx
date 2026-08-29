import type {Filter, SearchFilterCommonProps} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useSearchTagFilters from '@hooks/useSearchTagFilters';

import {getCleanedTagName} from '@libs/PolicyUtils';
import {sortOptionsWithEmptyValue} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

import React, {useMemo} from 'react';

import MultiSelect from './MultiSelect';

type TagSelectorProps = SearchFilterCommonProps<string[] | undefined> & {
    policyID: Filter | undefined;
};

function TagSelector({value = [], policyID, selectionListTextInputStyle, selectionListStyle, autoFocus, footer, onChange}: TagSelectorProps) {
    const {translate, localeCompare} = useLocalize();
    const {searchResults, isLoading, hasMore, loadMore, search} = useSearchTagFilters();

    const tagItems = useMemo(() => {
        const items = [{text: translate('search.noTag'), value: CONST.SEARCH.TAG_EMPTY_VALUE as string}];
        const uniqueTagNames = new Set<string>();

        // Extract unique tag names from all policies in the search results
        for (const policyTags of Object.values(searchResults ?? {})) {
            for (const tag of Object.values(policyTags ?? {})) {
                uniqueTagNames.add(tag.tagName);
            }
        }

        items.push(
            ...Array.from(uniqueTagNames)
                .map((tagName) => ({text: getCleanedTagName(tagName), value: tagName}))
                .toSorted((a, b) => sortOptionsWithEmptyValue(a.text.toString(), b.text.toString(), localeCompare)),
        );

        return items;
    }, [searchResults, translate, localeCompare]);

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
            loading={isLoading && tagItems.length <= 1}
        />
    );
}

export default TagSelector;
