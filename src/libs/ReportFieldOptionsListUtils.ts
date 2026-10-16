import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import type {OptionData} from './ReportUtils';

import tokenizedSearch from './tokenizedSearch';

/**
 * Transforms the provided report field options into option objects.
 *
 * @param reportFieldOptions - an initial report field options array
 */
function getReportFieldOptions(reportFieldOptions: string[], selectedKeys?: Set<string>) {
    return reportFieldOptions.map((name) => ({
        text: name,
        keyForList: name,
        searchText: name,
        tooltipText: name,
        isDisabled: false,
        isSelected: selectedKeys ? selectedKeys.has(name) : false,
    }));
}

/**
 * Build the section list for report field options
 */
function getReportFieldOptionsSection({
    options,
    recentlyUsedOptions,
    selectedOptions,
    initiallySelectedValue,
    searchValue,
    translate,
}: {
    options: string[];
    recentlyUsedOptions: string[];
    selectedOptions: Array<Partial<OptionData>>;
    initiallySelectedValue: string;
    searchValue: string;
    translate: LocalizedTranslate;
}) {
    const reportFieldOptionsSections = [];
    // The live selection drives the checkmark (isSelected)...
    const selectedKeySet = new Set(selectedOptions.map(({text, keyForList, name}) => text ?? keyForList ?? name ?? '').filter((o) => !!o));
    // ...while the frozen initial selection drives the pinned "Selected" section, so selecting a value marks it without reordering the list until reopen.
    const pinnedOptionKeys = initiallySelectedValue ? [initiallySelectedValue] : [];
    const pinnedKeySet = new Set(pinnedOptionKeys);

    if (searchValue) {
        const searchOptions = tokenizedSearch(options, searchValue, (option) => [option]);
        // Keep the pinned option(s) at the top of the search results, matching the "Selected" section shown when not searching.
        const pinnedSearchOptions: string[] = [];
        const otherSearchOptions: string[] = [];
        for (const option of searchOptions) {
            (pinnedKeySet.has(option) ? pinnedSearchOptions : otherSearchOptions).push(option);
        }
        const orderedSearchOptions = [...pinnedSearchOptions, ...otherSearchOptions];

        reportFieldOptionsSections.push({
            // "Search" section
            title: '',
            sectionIndex: 0,
            data: getReportFieldOptions(orderedSearchOptions, selectedKeySet),
        });

        return reportFieldOptionsSections;
    }

    const enabledOptionSet = new Set(options);
    const filteredRecentlyUsedOptions = recentlyUsedOptions.filter((o) => !pinnedKeySet.has(o) && enabledOptionSet.has(o));
    const filteredOptions = options.filter((o) => !pinnedKeySet.has(o));

    if (pinnedOptionKeys.length) {
        reportFieldOptionsSections.push({
            // "Selected" (pinned) section
            title: '',
            sectionIndex: 1,
            data: getReportFieldOptions(pinnedOptionKeys, selectedKeySet),
        });
    }

    if (filteredRecentlyUsedOptions.length > 0) {
        reportFieldOptionsSections.push({
            // "Recent" section
            title: translate('common.recent'),
            sectionIndex: 2,
            data: getReportFieldOptions(filteredRecentlyUsedOptions, selectedKeySet),
        });
    }

    reportFieldOptionsSections.push({
        // "All" section when items amount more than the threshold
        title: translate('common.all'),
        sectionIndex: 3,
        data: getReportFieldOptions(filteredOptions, selectedKeySet),
    });

    return reportFieldOptionsSections;
}

// eslint-disable-next-line import/prefer-default-export
export {getReportFieldOptionsSection};
