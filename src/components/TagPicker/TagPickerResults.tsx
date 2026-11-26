/** Builds the rows and search status from the lower-priority query, not the input value. */
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getHeaderMessageForNonUserList} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import type {SelectedTagOption} from '@libs/TagsOptionsListUtils';
import {getTagListSections} from '@libs/TagsOptionsListUtils';

import CONST from '@src/CONST';
import type {PolicyTag} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import React from 'react';

type TagPickerModel = {
    tags: Array<PolicyTag | SelectedTagOption>;
    selectedOptions: SelectedTagOption[];
    selectedTag: string;
    recentlyUsedTags: string[];
    searchInputThreshold: number;
    shouldOrderListByTagName: boolean;
    shouldShowGLCode: boolean;
    canSearch: boolean;
    hasSearchablePolicyTags: boolean;
    isLoading: boolean;
};

type TagPickerSections = ReturnType<typeof getTagListSections>;

type TagPickerResultsProps = {
    model: TagPickerModel;
    searchQuery: string;
    onSelectTag: (tag: Partial<OptionData>) => void;
    unfilteredSections?: TagPickerSections;
    addBottomSafeAreaPadding: boolean;
};

function buildTagPickerSections(
    model: TagPickerModel,
    searchQuery: string,
    {translate, localeCompare}: Pick<ReturnType<typeof useLocalize>, 'translate' | 'localeCompare'>,
): TagPickerSections {
    const {tags, selectedOptions, recentlyUsedTags, searchInputThreshold, shouldShowGLCode} = model;
    return getTagListSections({searchValue: searchQuery, selectedOptions, tags, recentlyUsedTags, localeCompare, translate, shouldShowGLCode, searchInputThreshold});
}

function TagPickerResults({model, searchQuery, onSelectTag, unfilteredSections, addBottomSafeAreaPadding}: TagPickerResultsProps) {
    const {selectedTag, shouldOrderListByTagName, canSearch, isLoading} = model;
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();

    const preparedSections = searchQuery ? undefined : unfilteredSections;
    const tagSections = isLoading ? getEmptyArray<never>() : (preparedSections ?? buildTagPickerSections(model, searchQuery, {translate, localeCompare}));
    const sections = tagSections.map((section) => ({
        ...section,
        data: (shouldOrderListByTagName ? section.data.toSorted((a, b) => localeCompare(a.text ?? '', b.text ?? '')) : section.data).map((tag) => ({...tag, titleStyles: styles.w100})),
    }));

    const selectedOptionKey = sections.at(0)?.data.find((tag) => tag.searchText === selectedTag)?.keyForList;
    const itemCount = sections.reduce((total, section) => total + section.data.length, 0);

    return (
        <>
            {canSearch && (
                <SelectionListWithSections.SearchStatus
                    query={searchQuery}
                    itemCount={itemCount}
                    message={isLoading ? undefined : getHeaderMessageForNonUserList(translate, (sections.at(0)?.data.length ?? 0) > 0, searchQuery)}
                    isLoading={isLoading}
                />
            )}
            <SelectionListWithSections.Viewport
                sections={sections}
                rowComponent={SingleSelectListItem}
                style={{sectionTitleStyles: styles.mt5}}
                searchQuery={searchQuery}
                loading={isLoading ? <OptionsListSkeletonView /> : undefined}
                initiallyFocusedItemKey={selectedOptionKey}
                onSelectRow={onSelectTag}
                addBottomSafeAreaPadding={addBottomSafeAreaPadding}
                titleNumberOfLines={CONST.TRANSACTION_TAG_AND_CATEGORY_PICKER_MAX_TITLE_LINES}
            />
        </>
    );
}

export default TagPickerResults;
export {buildTagPickerSections};
export type {TagPickerModel, TagPickerSections};
