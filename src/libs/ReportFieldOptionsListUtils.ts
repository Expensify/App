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
    searchValue,
    translate,
}: {
    options: string[];
    recentlyUsedOptions: string[];
    selectedOptions: Array<Partial<OptionData>>;
    searchValue: string;
    translate: LocalizedTranslate;
}) {
    const reportFieldOptionsSections = [];
    const selectedOptionKeys = selectedOptions.map(({text, keyForList, name}) => text ?? keyForList ?? name ?? '').filter((o) => !!o);
    const selectedKeySet = new Set(selectedOptionKeys);

    if (searchValue) {
        const searchOptions = tokenizedSearch(options, searchValue, (option) => [option]);

        reportFieldOptionsSections.push({
            // "Search" section
            title: '',
            sectionIndex: 0,
            data: getReportFieldOptions(searchOptions, selectedKeySet),
        });

        return reportFieldOptionsSections;
    }

    const filteredRecentlyUsedOptions = recentlyUsedOptions.filter((o) => !selectedKeySet.has(o));
    const filteredOptions = options.filter((o) => !selectedKeySet.has(o));

    if (selectedOptionKeys.length) {
        reportFieldOptionsSections.push({
            // "Selected" section
            title: '',
            sectionIndex: 1,
            data: getReportFieldOptions(selectedOptionKeys, selectedKeySet),
        });
    }

    if (filteredRecentlyUsedOptions.length > 0) {
        reportFieldOptionsSections.push({
            // "Recent" section
            title: translate('common.recent'),
            sectionIndex: 2,
            data: getReportFieldOptions(filteredRecentlyUsedOptions),
        });
    }

    reportFieldOptionsSections.push({
        // "All" section when items amount more than the threshold
        title: translate('common.all'),
        sectionIndex: 3,
        data: getReportFieldOptions(filteredOptions),
    });

    return reportFieldOptionsSections;
}

// eslint-disable-next-line import/prefer-default-export
export {getReportFieldOptionsSection};
