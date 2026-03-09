import type {OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import CONST from '@src/CONST';
import type {Policy, TaxRate, TaxRates, Transaction} from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import tokenizedSearch from './tokenizedSearch';
import {transformedTaxRates} from './TransactionUtils';

type TaxRatesOption = {
    text?: string;
    code?: string;
    searchText?: string;
    tooltipText?: string;
    isDisabled?: boolean;
    keyForList: string;
    isSelected?: boolean;
    pendingAction?: OnyxCommon.PendingAction;
};

type Tax = {
    modifiedName: string;
    isSelected?: boolean;
    isDisabled?: boolean;
};

/**
 * Sorts tax rates alphabetically by name.
 */
function sortTaxRates(taxRates: TaxRates, localeCompare: LocaleContextProps['localeCompare']): TaxRate[] {
    const sortedTaxRates = Object.values(taxRates).sort((a, b) => localeCompare(a.name, b.name));
    return sortedTaxRates;
}

/**
 * Builds the options for taxRates
 */
function getTaxRatesOptions(taxRates: Array<Partial<TaxRate>>): TaxRatesOption[] {
    return taxRates.map(({code, modifiedName, isDisabled, isSelected, pendingAction}, index) => ({
        code,
        text: modifiedName,
        keyForList: `${modifiedName}-${index}`,
        searchText: modifiedName,
        tooltipText: modifiedName,
        isDisabled: !!isDisabled || pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        isSelected,
        pendingAction,
    }));
}

/**
 * Builds the section list for tax rates
 */
function getTaxRatesSection({
    policy,
    searchValue,
    localeCompare,
    selectedOptions = [],
    transaction,
}: {
    policy: OnyxEntry<Policy> | undefined;
    searchValue: string;
    localeCompare: LocaleContextProps['localeCompare'];
    selectedOptions?: Tax[];
    transaction?: OnyxEntry<Transaction>;
}): Array<Section<TaxRatesOption>> {
    const policyRatesSections = [];

    const taxes = transformedTaxRates(policy, transaction);

    const sortedTaxRates = sortTaxRates(taxes, localeCompare);
    const sortedTaxRateNames = new Set(sortedTaxRates.map((taxRate) => taxRate.modifiedName));
    const selectedOptionNames = new Set(selectedOptions.map((selectedOption) => selectedOption.modifiedName));
    const enabledTaxRates = sortedTaxRates.filter((taxRate) => !taxRate.isDisabled);
    const enabledTaxRatesNames = new Set(enabledTaxRates.map((tax) => tax.modifiedName));
    const enabledTaxRatesWithoutSelectedOptions = enabledTaxRates.filter((tax) => tax.modifiedName && !selectedOptionNames.has(tax.modifiedName));
    const selectedTaxRateWithDisabledState: Tax[] = [];
    const numberOfEnabledTaxRates = enabledTaxRates.length;

    for (const tax of selectedOptions) {
        if (enabledTaxRatesNames.has(tax.modifiedName)) {
            selectedTaxRateWithDisabledState.push({...tax, isDisabled: false, isSelected: true});
            continue;
        }
        selectedTaxRateWithDisabledState.push({...tax, isDisabled: true, isSelected: true});
    }

    // If all tax are disabled but there's a previously selected tag, show only the selected tag
    if (numberOfEnabledTaxRates === 0 && selectedOptions.length > 0) {
        policyRatesSections.push({
            // "Selected" section
            title: '',
            sectionIndex: 0,
            data: getTaxRatesOptions(selectedTaxRateWithDisabledState),
        });

        return policyRatesSections;
    }

    if (searchValue) {
        const taxesForSearch = [
            ...tokenizedSearch(selectedTaxRateWithDisabledState, searchValue, (taxRate) => [taxRate.modifiedName ?? '']),
            ...tokenizedSearch(enabledTaxRatesWithoutSelectedOptions, searchValue, (taxRate) => [taxRate.modifiedName ?? '']),
        ];

        policyRatesSections.push({
            // "Search" section
            title: '',
            sectionIndex: 1,
            data: getTaxRatesOptions(taxesForSearch),
        });

        return policyRatesSections;
    }

    const selectedTaxRatesOutsideSortedTaxRates = selectedTaxRateWithDisabledState.filter((taxRate) => !taxRate.modifiedName || !sortedTaxRateNames.has(taxRate.modifiedName));
    const totalVisibleTaxRates = sortedTaxRates.length + selectedTaxRatesOutsideSortedTaxRates.length;

    if (totalVisibleTaxRates <= CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD) {
        const sortedTaxRatesWithSelectionState = sortedTaxRates.map((taxRate) => ({
            ...taxRate,
            isSelected: !!taxRate.modifiedName && selectedOptionNames.has(taxRate.modifiedName),
        }));

        policyRatesSections.push({
            // Keep the natural sorted order for small lists and only preserve unmatched selected items outside the list.
            title: '',
            sectionIndex: 2,
            data: getTaxRatesOptions([...selectedTaxRatesOutsideSortedTaxRates, ...sortedTaxRatesWithSelectionState]),
        });

        return policyRatesSections;
    }

    if (selectedOptions.length > 0) {
        policyRatesSections.push({
            // "Selected" section
            title: '',
            sectionIndex: 3,
            data: getTaxRatesOptions(selectedTaxRateWithDisabledState),
        });
    }

    policyRatesSections.push({
        // "All" section when number of items are more than the threshold
        title: '',
        sectionIndex: 4,
        data: getTaxRatesOptions(enabledTaxRatesWithoutSelectedOptions),
    });

    return policyRatesSections;
}

export {getTaxRatesSection, getTaxRatesOptions};
export type {TaxRatesOption, Tax};
