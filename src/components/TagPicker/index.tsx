import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLoadPolicyTags from '@hooks/useLoadPolicyTags';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import {getTagList, matchesParentTagPath} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import type {SelectedTagOption} from '@libs/TagsOptionsListUtils';
import {getTagArrayFromName} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTag, PolicyTags} from '@src/types/onyx';

import React, {startTransition, useDeferredValue, useState} from 'react';

import type {TagPickerModel} from './TagPickerResults';

import TagPickerResults from './TagPickerResults';

type TagPickerProps = {
    /** The policyID we are getting tags for */
    policyID: string | undefined;

    /** The selected tag of the expense */
    selectedTag: string;

    /** The current transaction tag of the expense */
    transactionTag?: string;

    /** Whether the policy has dependent tags */
    hasDependentTags?: boolean;

    /** The name of tag list we are getting tags for */
    tagListName: string;

    onSubmit: (selectedTag: Partial<OptionData>) => void;
    shouldShowDisabledAndSelectedOption?: boolean;

    /** Whether the list should be sorted by tag name. default is false */
    shouldOrderListByTagName?: boolean;

    tagListIndex: number;

    /**
     * Extra tag names to always surface as selectable options, on top of the policy's own tags.
     * Used to keep "orphaned" tags from a deleted source workspace selectable in flows like
     * split-edit where the active workspace no longer carries the original tag value.
     */
    additionalTagsToInclude?: string[];

    /** Whether to add bottom safe area padding to the list (for edge-to-edge bottom-docked modals) */
    addBottomSafeAreaPadding?: boolean;
    /**
     * Optional override for whether to show GL codes. When omitted, TagPicker reads
     * `showTagGLCodes && glCodes` from the policy in Onyx.
     */
    shouldShowGLCode?: boolean;

    /** Whether the search input should auto-focus when the picker mounts. Only opted into by the inline-edit popover wrapper. */
    shouldAutoFocusSearchInput?: boolean;

    /** Reports how many rows the unfiltered list renders, section headings included, so a container can size itself to them */
    onRenderedRowCountChange?: (rowCount: number) => void;

    /** Number of available tags at which the search input appears. Defaults to `CONST.STANDARD_LIST_ITEM_LIMIT`. */
    searchInputThreshold?: number;
};

const getSelectedOptions = (selectedTag: string): SelectedTagOption[] => {
    if (!selectedTag) {
        return [];
    }
    return [
        {
            name: selectedTag,
            enabled: true,
            accountID: undefined,
        },
    ];
};

type TagPickerSearchFieldProps = {
    canSearch: boolean;
    isLoading: boolean;
    shouldAutoFocusSearchInput: boolean;
    onQueryChange: (query: string) => void;
};

function TagPickerSearchField({canSearch, isLoading, shouldAutoFocusSearchInput, onQueryChange}: TagPickerSearchFieldProps) {
    const {inputCallbackRef} = useAutoFocusInput();
    const {translate} = useLocalize();
    const [query, setQuery] = useState('');

    if (!canSearch) {
        return null;
    }

    const updateQuery = (value: string) => {
        setQuery(value);
        // An urgent input update must not render the parent that builds the results.
        startTransition(() => onQueryChange(value));
    };

    return (
        <SelectionListWithSections.SearchInput
            ref={inputCallbackRef as (ref: BaseTextInputRef | null) => void}
            label={translate('common.search')}
            value={query}
            onChangeText={updateQuery}
            autoFocus={shouldAutoFocusSearchInput && canFocusInputOnScreenFocus()}
            isLoading={isLoading}
        />
    );
}

type TagPickerSearchProps = Pick<TagPickerProps, 'onSubmit' | 'onRenderedRowCountChange'> & {
    model: TagPickerModel;
    shouldAutoFocusSearchInput: boolean;
    addBottomSafeAreaPadding: boolean;
};

function TagPickerSearch({model, shouldAutoFocusSearchInput, onSubmit, onRenderedRowCountChange, addBottomSafeAreaPadding}: TagPickerSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <SelectionListWithSections.Root>
            <TagPickerSearchField
                canSearch={model.canSearch}
                isLoading={model.isLoading}
                shouldAutoFocusSearchInput={shouldAutoFocusSearchInput}
                onQueryChange={setSearchQuery}
            />
            <TagPickerResults
                model={model}
                searchQuery={searchQuery}
                onSelectTag={onSubmit}
                onRenderedRowCountChange={onRenderedRowCountChange}
                addBottomSafeAreaPadding={addBottomSafeAreaPadding}
            />
        </SelectionListWithSections.Root>
    );
}

function TagPicker({
    selectedTag,
    transactionTag,
    hasDependentTags,
    tagListName,
    policyID,
    tagListIndex,
    shouldShowDisabledAndSelectedOption = false,
    shouldOrderListByTagName = false,
    onSubmit,
    additionalTagsToInclude,
    addBottomSafeAreaPadding = false,
    shouldShowGLCode: shouldShowGLCodeProp,
    shouldAutoFocusSearchInput = false,
    onRenderedRowCountChange,
    searchInputThreshold = CONST.STANDARD_LIST_ITEM_LIMIT,
}: TagPickerProps) {
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const [shouldShowGLCodeFromPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        selector: (policy) => !!policy?.showTagGLCodes && !!policy?.glCodes,
    });
    const shouldShowGLCode = shouldShowGLCodeProp ?? shouldShowGLCodeFromPolicy;
    const [policyRecentlyUsedTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`);
    // Backfill the policy's tags on demand so lazy-loaded accounts don't get stuck showing only the selected tag.
    const {isLoadingPolicyTags} = useLoadPolicyTags(policyID);

    const policyRecentlyUsedTagsList = policyRecentlyUsedTags?.[tagListName] ?? [];
    const currentPolicyTagList = getTagList(policyTags, tagListIndex);
    // Tag lists can have identical display names, so use the key of the selected Onyx entry.
    const tagListKey = Object.entries(policyTags ?? {}).find(([, list]) => list === currentPolicyTagList)?.[0];
    const policyTagSnapshot = {
        policyID,
        tagListIndex,
        tagListName,
        tagListKey,
        policyTagList: currentPolicyTagList,
        isLoadingNewOptions: isLoadingPolicyTags && !additionalTagsToInclude?.length,
    };
    // Defer loading and tags together, but never show tags from a different workspace or list.
    const deferredTagSnapshot = useDeferredValue(policyTagSnapshot);
    const hasListBeenReplaced = deferredTagSnapshot.tagListKey !== undefined && deferredTagSnapshot.tagListKey !== tagListKey;
    const isSameTagList =
        deferredTagSnapshot.policyID === policyID && deferredTagSnapshot.tagListIndex === tagListIndex && deferredTagSnapshot.tagListName === tagListName && !hasListBeenReplaced;
    const {policyTagList, isLoadingNewOptions} = isSameTagList ? deferredTagSnapshot : policyTagSnapshot;
    const selectedOptions = getSelectedOptions(selectedTag);

    // Merge any orphaned tag names into the policy's tag map so they appear as selectable options.
    let policyTagsWithAdditions: PolicyTags;
    const baseTags = policyTagList.tags ?? {};
    if (!additionalTagsToInclude?.length) {
        policyTagsWithAdditions = baseTags;
    } else {
        const extras: PolicyTags = {};
        for (const name of additionalTagsToInclude) {
            if (!name || baseTags[name]) {
                continue;
            }
            extras[name] = {
                name,
                enabled: true,
            } as PolicyTag;
        }
        policyTagsWithAdditions = Object.keys(extras).length
            ? {
                  ...baseTags,
                  ...extras,
              }
            : baseTags;
    }

    // When the selected option is included explicitly, it takes precedence over the policy tag and the parent filter.
    const parentTag =
        hasDependentTags && !shouldShowDisabledAndSelectedOption
            ? getTagArrayFromName(transactionTag ?? '')
                  .slice(0, tagListIndex)
                  .join(':')
            : undefined;
    const enabledTags: Array<PolicyTag | SelectedTagOption> = shouldShowDisabledAndSelectedOption ? [...selectedOptions] : [];
    const selectedName = selectedOptions.at(0)?.name;
    let availableTagsCount = enabledTags.length;
    for (const policyTag of Object.values(policyTagsWithAdditions)) {
        if (shouldShowDisabledAndSelectedOption && (!policyTag.enabled || policyTag.name === selectedName)) {
            continue;
        }
        if (parentTag !== undefined && !matchesParentTagPath(policyTag, parentTag)) {
            continue;
        }
        enabledTags.push(policyTag);
        if (policyTag.enabled) {
            availableTagsCount++;
        }
    }

    const model: TagPickerModel = {
        selectedOptions,
        selectedTag,
        tags: enabledTags,
        recentlyUsedTags: policyRecentlyUsedTagsList,
        shouldShowGLCode: !!shouldShowGLCode,
        shouldOrderListByTagName,
        searchInputThreshold,
        canSearch: availableTagsCount >= searchInputThreshold,
        isLoading: isLoadingNewOptions,
    };

    return (
        <TagPickerSearch
            model={model}
            onSubmit={onSubmit}
            shouldAutoFocusSearchInput={shouldAutoFocusSearchInput}
            onRenderedRowCountChange={onRenderedRowCountChange}
            addBottomSafeAreaPadding={addBottomSafeAreaPadding}
        />
    );
}

export default TagPicker;
export type {TagPickerProps};
