import lodashSortBy from 'lodash/sortBy';
import CONST from '@src/CONST';
import type {PolicyTag, PolicyTagLists, PolicyTags} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import localeCompare from './LocaleCompare';
import * as Localize from './Localize';
import type {Option} from './OptionsListUtils';
import * as OptionsListUtils from './OptionsListUtils';
import * as PolicyUtils from './PolicyUtils';

type SelectedTagOption = {
    name: string;
    enabled: boolean;
    isSelected?: boolean;
    accountID: number | undefined;
    pendingAction?: PendingAction;
};

/**
 * Transforms the provided tags into option objects.
 *
 * @param tags - an initial tag array
 */
function getTagsOptions(tags: Array<Pick<PolicyTag, 'name' | 'enabled' | 'pendingAction'>>, selectedOptions?: SelectedTagOption[]): Option[] {
    return tags.map((tag) => {
        // This is to remove unnecessary escaping backslash in tag name sent from backend.
        const cleanedName = PolicyUtils.getCleanedTagName(tag.name);
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
    recentlyUsedTags = [],
    selectedOptions = [],
    searchValue = '',
    maxRecentReportsToShow = CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
}: {
    tags: PolicyTags | Array<SelectedTagOption | PolicyTag>;
    recentlyUsedTags?: string[];
    selectedOptions?: SelectedTagOption[];
    searchValue?: string;
    maxRecentReportsToShow?: number;
}) {
    const tagSections = [];
    const sortedTags = sortTags(tags);

    const selectedOptionNames = selectedOptions.map((selectedOption) => selectedOption.name);
    const enabledTags = sortedTags.filter((tag) => tag.enabled);
    const enabledTagsNames = enabledTags.map((tag) => tag.name);
    const enabledTagsWithoutSelectedOptions = enabledTags.filter((tag) => !selectedOptionNames.includes(tag.name));
    const selectedTagsWithDisabledState: SelectedTagOption[] = [];
    const numberOfTags = enabledTags.length;

    selectedOptions.forEach((tag) => {
        if (enabledTagsNames.includes(tag.name)) {
            selectedTagsWithDisabledState.push({...tag, enabled: true});
            return;
        }
        selectedTagsWithDisabledState.push({...tag, enabled: false});
    });

    // If all tags are disabled but there's a previously selected tag, show only the selected tag
    if (numberOfTags === 0 && selectedOptions.length > 0) {
        tagSections.push({
            // "Selected" section
            title: '',
            shouldShow: false,
            data: getTagsOptions(selectedTagsWithDisabledState, selectedOptions),
        });

        return tagSections;
    }

    if (searchValue) {
        const enabledSearchTags = enabledTagsWithoutSelectedOptions.filter((tag) => PolicyUtils.getCleanedTagName(tag.name.toLowerCase()).includes(searchValue.toLowerCase()));
        const selectedSearchTags = selectedTagsWithDisabledState.filter((tag) => PolicyUtils.getCleanedTagName(tag.name.toLowerCase()).includes(searchValue.toLowerCase()));
        const tagsForSearch = [...selectedSearchTags, ...enabledSearchTags];

        tagSections.push({
            // "Search" section
            title: '',
            shouldShow: true,
            data: getTagsOptions(tagsForSearch, selectedOptions),
        });

        return tagSections;
    }

    if (numberOfTags < CONST.TAG_LIST_THRESHOLD) {
        tagSections.push({
            // "All" section when items amount less than the threshold
            title: '',
            shouldShow: false,
            data: getTagsOptions([...selectedTagsWithDisabledState, ...enabledTagsWithoutSelectedOptions], selectedOptions),
        });

        return tagSections;
    }

    const filteredRecentlyUsedTags = recentlyUsedTags
        .filter((recentlyUsedTag) => {
            const tagObject = sortedTags.find((tag) => tag.name === recentlyUsedTag);
            return !!tagObject?.enabled && !selectedOptionNames.includes(recentlyUsedTag) && tagObject?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        })
        .map((tag) => ({name: tag, enabled: true}));

    if (selectedOptions.length) {
        tagSections.push({
            // "Selected" section
            title: '',
            shouldShow: true,
            data: getTagsOptions(selectedTagsWithDisabledState, selectedOptions),
        });
    }

    if (filteredRecentlyUsedTags.length > 0) {
        const cutRecentlyUsedTags = filteredRecentlyUsedTags.slice(0, maxRecentReportsToShow);

        tagSections.push({
            // "Recent" section
            title: Localize.translateLocal('common.recent'),
            shouldShow: true,
            data: getTagsOptions(cutRecentlyUsedTags, selectedOptions),
        });
    }

    tagSections.push({
        // "All" section when items amount more than the threshold
        title: Localize.translateLocal('common.all'),
        shouldShow: true,
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

    return OptionsListUtils.hasEnabledOptions(policyTagValueList);
}

/**
 * Sorts tags alphabetically by name.
 */
function sortTags(tags: Record<string, PolicyTag | SelectedTagOption> | Array<PolicyTag | SelectedTagOption>) {
    // Use lodash's sortBy to ensure consistency with oldDot.
    return lodashSortBy(tags, 'name', localeCompare) as PolicyTag[];
}

export {getTagsOptions, getTagListSections, hasEnabledTags, sortTags};
export type {SelectedTagOption};
