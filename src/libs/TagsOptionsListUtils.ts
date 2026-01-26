import type {OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {Policy, PolicyTag, PolicyTagLists, PolicyTags, Transaction} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import {hasEnabledOptions} from './OptionsListUtils';
import type {Option} from './OptionsListUtils';
import {getCleanedTagName, getTagLists, hasDependentTags as hasDependentTagsPolicyUtils, isMultiLevelTags as isMultiLevelTagsPolicyUtils} from './PolicyUtils';
import tokenizedSearch from './tokenizedSearch';
import {getTagArrayFromName, getTagForDisplay} from './TransactionUtils';

type SelectedTagOption = {
    name: string;
    enabled: boolean;
    isSelected?: boolean;
    accountID: number | undefined;
    pendingAction?: PendingAction;
};

type TagOption = Option & {
    keyForList: string;
};

type TagVisibility = {
    /** Flag indicating if the tag is required */
    isTagRequired: boolean;

    /** Flag indicating if the tag should be shown */
    shouldShow: boolean;
};

/**
 * Transforms the provided tags into option objects.
 *
 * @param tags - an initial tag array
 */
function getTagsOptions(tags: Array<Pick<PolicyTag, 'name' | 'enabled' | 'pendingAction'>>, selectedOptions?: SelectedTagOption[]): TagOption[] {
    return tags.map((tag) => {
        // This is to remove unnecessary escaping backslash in tag name sent from backend.
        const cleanedName = getCleanedTagName(tag.name);
        return {
            text: cleanedName,
            keyForList: tag.name,
            searchText: tag.name,
            tooltipText: cleanedName,
            isDisabled: !tag.enabled || tag.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            isSelected: selectedOptions?.some((selectedTag) => selectedTag.name === tag.name),
            pendingAction: tag.pendingAction,
        };
    });
}

/**
 * Build the section list for tags
 */
function getTagListSections({
    tags,
    localeCompare,
    recentlyUsedTags = [],
    selectedOptions = [],
    searchValue = '',
    maxRecentReportsToShow = CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
    translate,
}: {
    tags: PolicyTags | Array<SelectedTagOption | PolicyTag>;
    localeCompare: LocaleContextProps['localeCompare'];
    recentlyUsedTags?: string[];
    selectedOptions?: SelectedTagOption[];
    searchValue?: string;
    maxRecentReportsToShow?: number;
    translate: LocalizedTranslate;
}) {
    const tagSections = [];
    const sortedTags = sortTags(tags, localeCompare);

    const selectedOptionNames = new Set(selectedOptions.map((selectedOption) => selectedOption.name));
    const enabledTags = sortedTags.filter((tag) => tag.enabled);
    const enabledTagsNames = new Set(enabledTags.map((tag) => tag.name));
    const enabledTagsWithoutSelectedOptions = enabledTags.filter((tag) => !selectedOptionNames.has(tag.name));
    const selectedTagsWithDisabledState: SelectedTagOption[] = [];
    const numberOfTags = enabledTags.length;

    for (const tag of selectedOptions) {
        if (enabledTagsNames.has(tag.name)) {
            selectedTagsWithDisabledState.push({...tag, enabled: true});
            continue;
        }
        selectedTagsWithDisabledState.push({...tag, enabled: false});
    }

    // If all tags are disabled but there's a previously selected tag, show only the selected tag
    if (numberOfTags === 0 && selectedOptions.length > 0) {
        tagSections.push({
            // "Selected" section
            title: '',
            sectionIndex: 0,
            data: getTagsOptions(selectedTagsWithDisabledState, selectedOptions),
        });

        return tagSections;
    }

    if (searchValue) {
        const tagsForSearch = [
            ...tokenizedSearch(selectedTagsWithDisabledState, searchValue, (tag) => [getCleanedTagName(tag.name)]),
            ...tokenizedSearch(enabledTagsWithoutSelectedOptions, searchValue, (tag) => [getCleanedTagName(tag.name)]),
        ];

        tagSections.push({
            // "Search" section
            title: '',
            sectionIndex: 1,
            data: getTagsOptions(tagsForSearch, selectedOptions),
        });

        return tagSections;
    }

    if (numberOfTags < CONST.STANDARD_LIST_ITEM_LIMIT) {
        tagSections.push({
            // "All" section when items amount less than the threshold
            title: '',
            sectionIndex: 2,
            data: getTagsOptions([...selectedTagsWithDisabledState, ...enabledTagsWithoutSelectedOptions], selectedOptions),
        });

        return tagSections;
    }

    const filteredRecentlyUsedTags = recentlyUsedTags
        .filter((recentlyUsedTag) => {
            const tagObject = sortedTags.find((tag) => tag.name === recentlyUsedTag);
            return !!tagObject?.enabled && !selectedOptionNames.has(recentlyUsedTag) && tagObject?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        })
        .map((tag) => ({name: tag, enabled: true}));

    if (selectedOptions.length) {
        tagSections.push({
            // "Selected" section
            title: '',
            sectionIndex: 3,
            data: getTagsOptions(selectedTagsWithDisabledState, selectedOptions),
        });
    }

    if (filteredRecentlyUsedTags.length > 0) {
        const cutRecentlyUsedTags = filteredRecentlyUsedTags.slice(0, maxRecentReportsToShow);

        tagSections.push({
            // "Recent" section
            title: translate('common.recent'),
            sectionIndex: 4,
            data: getTagsOptions(cutRecentlyUsedTags, selectedOptions),
        });
    }

    tagSections.push({
        // "All" section when items amount more than the threshold
        title: translate('common.all'),
        sectionIndex: 5,
        data: getTagsOptions(enabledTagsWithoutSelectedOptions, selectedOptions),
    });

    return tagSections;
}

/**
 * Verifies that there is at least one enabled tag
 */
function hasEnabledTags(policyTagList: Array<PolicyTagLists[keyof PolicyTagLists]>) {
    const policyTagValueList = policyTagList
        .filter((tag) => tag && tag.tags)
        .map(({tags}) => Object.values(tags))
        .flat();

    return hasEnabledOptions(policyTagValueList);
}

/**
 * Sorts tags alphabetically by name.
 */
function sortTags(tags: Record<string, PolicyTag | SelectedTagOption> | Array<PolicyTag | SelectedTagOption>, localeCompare: LocaleContextProps['localeCompare']) {
    return Object.values(tags ?? {}).sort((a, b) => localeCompare(a.name, b.name)) as PolicyTag[];
}

/**
 * Calculate tag visibility for each tag list
 */
function getTagVisibility({
    shouldShowTags,
    policy,
    policyTags,
    transaction,
}: {
    shouldShowTags: boolean;
    policy: Policy | undefined;
    policyTags: OnyxEntry<PolicyTagLists>;
    transaction: Transaction | undefined;
}): TagVisibility[] {
    const hasDependentTags = hasDependentTagsPolicyUtils(policy, policyTags);
    const isMultilevelTags = isMultiLevelTagsPolicyUtils(policyTags);
    const policyTagLists = getTagLists(policyTags);

    return policyTagLists.map(({tags, required}, index) => {
        const isTagRequired = required ?? false;
        let shouldShow = false;

        if (shouldShowTags) {
            if (hasDependentTags) {
                if (index === 0) {
                    shouldShow = true;
                } else {
                    const prevTagValue = getTagForDisplay(transaction, index - 1);
                    shouldShow = !!prevTagValue;
                }
            } else {
                shouldShow = !isMultilevelTags || hasEnabledOptions(tags);
            }
        }

        return {
            isTagRequired,
            shouldShow,
        };
    });
}

/**
 * Checks if any tag from policy tag lists exists in the transaction tag string.
 *
 * @param policyTagLists - The policy tag lists object containing tag list records
 * @param transactionTag - The transaction tag string, potentially multi-level
 * @returns true if at least one tag from policyTagLists is found in the transaction tag string
 */
function hasMatchingTag(policyTagLists: OnyxEntry<PolicyTagLists>, transactionTag: string): boolean {
    if (!policyTagLists || !transactionTag) {
        return false;
    }

    const transactionTagArray = getTagArrayFromName(transactionTag);

    return transactionTagArray.some((tag) => {
        const tagName = tag.trim();
        return Object.values(policyTagLists).some((tagList) => {
            if (!tagList?.tags) {
                return false;
            }
            return Object.values(tagList.tags).some((policyTag) => policyTag.name === tagName && policyTag.enabled);
        });
    });
}

export {getTagsOptions, getTagListSections, hasEnabledTags, sortTags, getTagVisibility, hasMatchingTag};
export type {SelectedTagOption, TagVisibility};
