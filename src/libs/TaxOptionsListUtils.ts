import lodashSortBy from 'lodash/sortBy';
import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {Policy, TaxRate, TaxRates, Transaction} from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import * as TransactionUtils from './TransactionUtils';

type TaxRatesOption = {
    text?: string;
    code?: string;
    searchText?: string;
    tooltipText?: string;
    isDisabled?: boolean;
    keyForList?: string;
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
function sortTaxRates(taxRates: TaxRates): TaxRate[] {
    const sortedtaxRates = lodashSortBy(taxRates, (taxRate) => taxRate.name);
    return sortedtaxRates;
}

/**
 * Builds the options for taxRates
 */
function getTaxRatesOptions(taxRates: Array<Partial<TaxRate>>): TaxRatesOption[] {
    return taxRates.map(({code, modifiedName, isDisabled, isSelected, pendingAction}) => ({
        code,
        text: modifiedName,
        keyForList: modifiedName,
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
    selectedOptions = [],
    transaction,
}: {
    policy: OnyxEntry<Policy> | undefined;
    searchValue: string;
    selectedOptions?: Tax[];
    transaction?: OnyxEntry<Transaction>;
}): TaxSection[] {
    const policyRatesSections = [];

    const taxes = TransactionUtils.transformedTaxRates(policy, transaction);

    const sortedTaxRates = sortTaxRates(taxes);
    const selectedOptionNames = selectedOptions.map((selectedOption) => selectedOption.modifiedName);
    const enabledTaxRates = sortedTaxRates.filter((taxRate) => !taxRate.isDisabled);
    const enabledTaxRatesNames = enabledTaxRates.map((tax) => tax.modifiedName);
    const enabledTaxRatesWithoutSelectedOptions = enabledTaxRates.filter((tax) => tax.modifiedName && !selectedOptionNames.includes(tax.modifiedName));
    const selectedTaxRateWithDisabledState: Tax[] = [];
    const numberOfTaxRates = enabledTaxRates.length;

    selectedOptions.forEach((tax) => {
        if (enabledTaxRatesNames.includes(tax.modifiedName)) {
            selectedTaxRateWithDisabledState.push({...tax, isDisabled: false, isSelected: true});
            return;
        }
        selectedTaxRateWithDisabledState.push({...tax, isDisabled: true, isSelected: true});
    });

    // If all tax are disabled but there's a previously selected tag, show only the selected tag
    if (numberOfTaxRates === 0 && selectedOptions.length > 0) {
        policyRatesSections.push({
            // "Selected" sectiong
            title: '',
            shouldShow: false,
            data: getTaxRatesOptions(selectedTaxRateWithDisabledState),
        });

        return policyRatesSections;
    }

    if (searchValue) {
        const enabledSearchTaxRates = enabledTaxRatesWithoutSelectedOptions.filter((taxRate) => taxRate.modifiedName?.toLowerCase().includes(searchValue.toLowerCase()));
        const selectedSearchTags = selectedTaxRateWithDisabledState.filter((taxRate) => taxRate.modifiedName?.toLowerCase().includes(searchValue.toLowerCase()));
        const taxesForSearch = [...selectedSearchTags, ...enabledSearchTaxRates];

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

export {getTaxRatesSection, sortTaxRates, getTaxRatesOptions};
export type {TaxRatesOption, Tax, TaxSection};
