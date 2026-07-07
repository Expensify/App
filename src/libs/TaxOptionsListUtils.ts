import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';

import CONST from '@src/CONST';
import type {Policy, TaxRate, TaxRates, Transaction} from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

import type {OnyxEntry} from 'react-native-onyx';

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
    const selectedOptionNames = new Set(selectedOptions.map((selectedOption) => selectedOption.modifiedName));
    // Keep rates that are pending deletion (e.g. deleted while offline) so they still render struck-through and non-selectable,
    // instead of dropping them via the isDisabled filter. getTaxRatesOptions forces isDisabled for pending-DELETE rows.
    const enabledTaxRates = sortedTaxRates.filter((taxRate) => !taxRate.isDisabled || taxRate.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const enabledTaxRatesNames = new Set(enabledTaxRates.map((tax) => tax.modifiedName));
    const enabledTaxRatesWithoutSelectedOptions = enabledTaxRates.filter((tax) => tax.modifiedName && !selectedOptionNames.has(tax.modifiedName));
    const taxRatesByModifiedName = new Map(sortedTaxRates.map((taxRate) => [taxRate.modifiedName, taxRate]));
    const selectedTaxRateWithDisabledState: Array<Partial<TaxRate>> = [];
    const numberOfTaxRates = enabledTaxRates.length;

    for (const tax of selectedOptions) {
        // Forward the underlying rate's pendingAction (already available from transformedTaxRates) so a selected rate that is
        // pending deletion still renders struck-through and non-selectable via getTaxRatesOptions instead of a selectable row.
        const pendingAction = taxRatesByModifiedName.get(tax.modifiedName)?.pendingAction;
        if (enabledTaxRatesNames.has(tax.modifiedName)) {
            selectedTaxRateWithDisabledState.push({...tax, pendingAction, isDisabled: false, isSelected: true});
            continue;
        }
        selectedTaxRateWithDisabledState.push({...tax, pendingAction, isDisabled: true, isSelected: true});
    }

    // If all tax are disabled but there's a previously selected tag, show only the selected tag
    if (numberOfTaxRates === 0 && selectedOptions.length > 0) {
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

    if (numberOfTaxRates < CONST.STANDARD_LIST_ITEM_LIMIT) {
        policyRatesSections.push({
            // "All" section when items amount less than the threshold
            title: '',
            sectionIndex: 2,
            data: getTaxRatesOptions([...selectedTaxRateWithDisabledState, ...enabledTaxRatesWithoutSelectedOptions]),
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

export {getTaxRatesSection};
export type {TaxRatesOption};
