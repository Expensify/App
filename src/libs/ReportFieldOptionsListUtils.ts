import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {Option} from './OptionsListUtils';
import type {OptionData} from './ReportUtils';
import tokenizedSearch from './tokenizedSearch';

type ReportFieldOption = Option & {keyForList: string};

/**
 * Transforms the provided report field options into option objects.
 *
 * @param reportFieldOptions - an initial report field options array
 */
function getReportFieldOptions(reportFieldOptions: string[]): ReportFieldOption[] {
    return reportFieldOptions.map((name) => ({
        text: name,
        keyForList: name,
        searchText: name,
        tooltipText: name,
        isDisabled: false,
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

    if (searchValue) {
        const searchOptions = tokenizedSearch(options, searchValue, (option) => [option]);

        reportFieldOptionsSections.push({
            // "Search" section
            title: '',
            sectionIndex: 0,
            data: getReportFieldOptions(searchOptions),
        });

        return reportFieldOptionsSections;
    }

    const filteredRecentlyUsedOptions = recentlyUsedOptions.filter((recentlyUsedOption) => !selectedOptionKeys.includes(recentlyUsedOption));
    const filteredOptions = options.filter((option) => !selectedOptionKeys.includes(option));

    if (selectedOptionKeys.length) {
        reportFieldOptionsSections.push({
            // "Selected" section
            title: '',
            sectionIndex: 1,
            data: getReportFieldOptions(selectedOptionKeys),
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

export {getReportFieldOptionsSection, getReportFieldOptions};
