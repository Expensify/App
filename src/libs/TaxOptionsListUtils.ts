import type {OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
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

type TaxSection = {
    title: string | undefined;
    shouldShow: boolean;
    data: TaxRatesOption[];
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
}): TaxSection[] {
    const policyRatesSections = [];

    const taxes = transformedTaxRates(policy, transaction);

    const sortedTaxRates = sortTaxRates(taxes, localeCompare);
    const selectedOptionNames = new Set(selectedOptions.map((selectedOption) => selectedOption.modifiedName));
    const enabledTaxRates = sortedTaxRates.filter((taxRate) => !taxRate.isDisabled);
    const enabledTaxRatesNames = new Set(enabledTaxRates.map((tax) => tax.modifiedName));
    const enabledTaxRatesWithoutSelectedOptions = enabledTaxRates.filter((tax) => tax.modifiedName && !selectedOptionNames.has(tax.modifiedName));
    const selectedTaxRateWithDisabledState: Tax[] = [];
    const numberOfTaxRates = enabledTaxRates.length;

    for (const tax of selectedOptions) {
        if (enabledTaxRatesNames.has(tax.modifiedName)) {
            selectedTaxRateWithDisabledState.push({...tax, isDisabled: false, isSelected: true});
            continue;
        }
        selectedTaxRateWithDisabledState.push({...tax, isDisabled: true, isSelected: true});
    }

    // If all tax are disabled but there's a previously selected tag, show only the selected tag
    if (numberOfTaxRates === 0 && selectedOptions.length > 0) {
        policyRatesSections.push({
            // "Selected" section
            title: '',
            shouldShow: false,
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
            shouldShow: true,
            data: getTaxRatesOptions(taxesForSearch),
        });

        return policyRatesSections;
    }

    if (numberOfTaxRates < CONST.STANDARD_LIST_ITEM_LIMIT) {
        policyRatesSections.push({
            // "All" section when items amount less than the threshold
            title: '',
            shouldShow: false,
            data: getTaxRatesOptions([...selectedTaxRateWithDisabledState, ...enabledTaxRatesWithoutSelectedOptions]),
        });

        return policyRatesSections;
    }

    if (selectedOptions.length > 0) {
        policyRatesSections.push({
            // "Selected" section
            title: '',
            shouldShow: true,
            data: getTaxRatesOptions(selectedTaxRateWithDisabledState),
        });
    }

    policyRatesSections.push({
        // "All" section when number of items are more than the threshold
        title: '',
        shouldShow: true,
        data: getTaxRatesOptions(enabledTaxRatesWithoutSelectedOptions),
    });

    return policyRatesSections;
}

export {getTaxRatesSection, getTaxRatesOptions};
export type {TaxRatesOption, Tax};
