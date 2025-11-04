import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {Option} from './OptionsListUtils';
import type {OptionData} from './ReportUtils';
import tokenizedSearch from './tokenizedSearch';

/**
 * Transforms the provided report field options into option objects.
 *
 * @param reportFieldOptions - an initial report field options array
 */
function getReportFieldOptions(reportFieldOptions: string[]): Option[] {
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
    let indexOffset = 0;

    if (searchValue) {
        const searchOptions = tokenizedSearch(options, searchValue, (option) => [option]);

        reportFieldOptionsSections.push({
            // "Search" section
            title: '',
            shouldShow: true,
            indexOffset,
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
            shouldShow: true,
            indexOffset,
            data: getReportFieldOptions(selectedOptionKeys),
        });

        indexOffset += selectedOptionKeys.length;
    }

    if (filteredRecentlyUsedOptions.length > 0) {
        reportFieldOptionsSections.push({
            // "Recent" section
            title: translate('common.recent'),
            shouldShow: true,
            indexOffset,
            data: getReportFieldOptions(filteredRecentlyUsedOptions),
        });

        indexOffset += filteredRecentlyUsedOptions.length;
    }

    reportFieldOptionsSections.push({
        // "All" section when items amount more than the threshold
        title: translate('common.all'),
        shouldShow: true,
        indexOffset,
        data: getReportFieldOptions(filteredOptions),
    });

    return reportFieldOptionsSections;
}

export {getReportFieldOptionsSection, getReportFieldOptions};
