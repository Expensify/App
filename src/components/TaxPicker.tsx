import React, {useState} from 'react';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getHeaderMessageForNonUserList} from '@libs/OptionsListUtils';
import {getTaxRatesSection} from '@libs/TaxOptionsListUtils';
import type {TaxRatesOption} from '@libs/TaxOptionsListUtils';
import {getDefaultTaxCode, getEnabledTaxRateCount, transformedTaxRates} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {IOUAction} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import RadioListItem from './SelectionList/ListItem/RadioListItem';
import SelectionListWithSections from './SelectionList/SelectionListWithSections';

type TaxPickerProps = {
    /** The selected tax rate of an expense */
    selectedTaxRate?: string;

    /** ID of the policy */
    policyID?: string;

    /** ID of the transaction */
    transactionID?: string;

    /** Callback to fire when a tax is pressed */
    onSubmit: (tax: TaxRatesOption, shouldClearTax?: boolean) => void;

    /** The action to take */
    action?: IOUAction;

    /** The type of IOU */
    iouType?: ValueOf<typeof CONST.IOU.TYPE>;

    onDismiss: () => void;

    /**
     * If enabled, the content will have a bottom padding equal to account for the safe bottom area inset.
     */
    addBottomSafeAreaPadding?: boolean;

    /**
     * If enabled, allows deselecting the currently selected tax rate by tapping it again.
     * When disabled (default), tapping the selected tax rate will dismiss the picker without calling onSubmit.
     */
    allowDeselect?: boolean;
};

function TaxPicker({
    selectedTaxRate = '',
    policyID,
    transactionID,
    onSubmit,
    action,
    iouType,
    onDismiss = Navigation.goBack,
    addBottomSafeAreaPadding,
    allowDeselect = false,
}: TaxPickerProps) {
    const {translate, localeCompare} = useLocalize();
    const [searchValue, setSearchValue] = useState('');
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [transaction] = useOnyx(
        (() => {
            if (shouldUseTransactionDraft(action)) {
                return `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}` as `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`;
            }
            return `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
        })(),
        {},
    );

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingSplitBill = isEditing && iouType === CONST.IOU.TYPE.SPLIT;
    const currentTransaction = isEditingSplitBill && !isEmptyObject(splitDraftTransaction) ? splitDraftTransaction : transaction;

    const taxRates = policy?.taxRates;
    const taxRatesCount = getEnabledTaxRateCount(taxRates?.taxes ?? {});
    const isTaxRatesCountBelowThreshold = taxRatesCount < CONST.STANDARD_LIST_ITEM_LIMIT;

    const shouldShowTextInput = !isTaxRatesCountBelowThreshold;

    const {taxCode, taxValue} = currentTransaction ?? {};
    const defaultTaxCode = getDefaultTaxCode(policy, currentTransaction) ?? '';
    const fallbackTaxCode = transactionID ? defaultTaxCode : '';
    const effectiveTaxCode = taxCode && taxCode.length > 0 ? taxCode : fallbackTaxCode;
    const effectiveSelectedTaxRate = selectedTaxRate || (effectiveTaxCode ? (transformedTaxRates(policy, currentTransaction)[effectiveTaxCode]?.modifiedName ?? '') : '');
    const hasTaxBeenDeleted = !!taxCode && taxValue !== undefined && !taxRates?.taxes?.[taxCode];
    const hasTaxValueChanged = !!taxCode && taxValue !== undefined && taxRates?.taxes?.[taxCode]?.value !== taxValue;

    const deletedTaxOption = !hasTaxBeenDeleted
        ? null
        : {
              code: undefined,
              text: taxValue ?? '',
              keyForList: taxCode ?? '',
              searchText: taxValue ?? '',
              tooltipText: taxValue ?? '',
              isDisabled: true,
              isSelected: true,
          };

    const selectedOptions = effectiveSelectedTaxRate
        ? [
              {
                  modifiedName: effectiveSelectedTaxRate,
                  isDisabled: false,
                  accountID: null,
              },
          ]
        : [];

    const sections = getTaxRatesSection({
        policy,
        searchValue,
        localeCompare,
        selectedOptions,
        transaction: currentTransaction,
    });

    const flattenedOptions = sections.flatMap((section) => section.data);
    const selectedOptionKey =
        flattenedOptions.find((taxRate) => taxRate.code === effectiveTaxCode)?.keyForList ?? flattenedOptions.find((taxRate) => taxRate.searchText === effectiveSelectedTaxRate)?.keyForList;

    const handleSelectRow = (newSelectedOption: TaxRatesOption) => {
        if (hasTaxValueChanged) {
            onSubmit(newSelectedOption, !newSelectedOption.code);
            return;
        }

        const isSameTaxCode = taxCode === newSelectedOption.code;
        const currentTaxRateValue = taxCode ? taxRates?.taxes?.[taxCode]?.value : undefined;
        const hasMatchingTaxValue = taxValue === undefined || currentTaxRateValue === taxValue;

        // If deselection is not allowed and the same option is selected, just dismiss
        if (!allowDeselect && isSameTaxCode && hasMatchingTaxValue) {
            onDismiss();
            return;
        }

        onSubmit(newSelectedOption, hasTaxBeenDeleted);
    };

    const textInputOptions = {
        label: translate('common.search'),
        value: searchValue,
        onChangeText: setSearchValue,
        headerMessage: getHeaderMessageForNonUserList((sections.at(0)?.data?.length ?? 0) > 0, searchValue),
    };

    const updatedSections = deletedTaxOption
        ? sections.map((section) => ({
              ...section,
              data: [...section.data.filter((item) => item.code !== deletedTaxOption.code), deletedTaxOption],
          }))
        : sections;

    return (
        <SelectionListWithSections
            sections={updatedSections}
            shouldShowTextInput={shouldShowTextInput}
            textInputOptions={textInputOptions}
            onSelectRow={handleSelectRow}
            ListItem={RadioListItem}
            initiallyFocusedItemKey={selectedOptionKey ?? undefined}
            addBottomSafeAreaPadding={addBottomSafeAreaPadding}
        />
    );
}

export default TaxPicker;
