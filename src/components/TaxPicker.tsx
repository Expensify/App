import React, {useState} from 'react';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getHeaderMessageForNonUserList} from '@libs/OptionsListUtils';
import {getTaxRatesSection} from '@libs/TaxOptionsListUtils';
import type {TaxRatesOption} from '@libs/TaxOptionsListUtils';
import {getEnabledTaxRateCount} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {IOUAction} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import RadioListItem from './SelectionList/ListItem/RadioListItem';
import SelectionList from './SelectionList/SelectionListWithSections';

type TaxPickerProps = {
    /** The selected tax rate of an expense */
    selectedTaxRate?: string;

    /** ID of the policy */
    policyID?: string;

    /** ID of the transaction */
    transactionID?: string;

    /** Callback to fire when a tax is pressed */
    onSubmit: (tax: TaxRatesOption) => void;

    /** The action to take */
    action?: IOUAction;

    /** The type of IOU */
    iouType?: ValueOf<typeof CONST.IOU.TYPE>;

    onDismiss: () => void;

    /**
     * If enabled, the content will have a bottom padding equal to account for the safe bottom area inset.
     */
    addBottomSafeAreaPadding?: boolean;
};

function TaxPicker({selectedTaxRate = '', policyID, transactionID, onSubmit, action, iouType, onDismiss = Navigation.goBack, addBottomSafeAreaPadding}: TaxPickerProps) {
    const {translate, localeCompare} = useLocalize();
    const [searchValue, setSearchValue] = useState('');
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: true});

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const [transaction] = useOnyx(
        (() => {
            if (shouldUseTransactionDraft(action)) {
                return `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}` as `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`;
            }
            return `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
        })(),
        {canBeMissing: true},
    );

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingSplitBill = isEditing && iouType === CONST.IOU.TYPE.SPLIT;
    const currentTransaction = isEditingSplitBill && !isEmptyObject(splitDraftTransaction) ? splitDraftTransaction : transaction;

    const taxRates = policy?.taxRates;
    const taxRatesCount = getEnabledTaxRateCount(taxRates?.taxes ?? {});
    const isTaxRatesCountBelowThreshold = taxRatesCount < CONST.STANDARD_LIST_ITEM_LIMIT;

    const shouldShowTextInput = !isTaxRatesCountBelowThreshold;

    const selectedOptions = selectedTaxRate
        ? [
              {
                  modifiedName: selectedTaxRate,
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

    const selectedOptionKey = sections?.at(0)?.data?.find((taxRate) => taxRate.searchText === selectedTaxRate)?.keyForList;

    const handleSelectRow = (newSelectedOption: TaxRatesOption) => {
        if (selectedOptionKey === newSelectedOption.keyForList) {
            onDismiss();
            return;
        }
        onSubmit(newSelectedOption);
    };

    const textInputOptions = {
        label: translate('common.search'),
        value: searchValue,
        onChangeText: setSearchValue,
        headerMessage: getHeaderMessageForNonUserList((sections.at(0)?.data?.length ?? 0) > 0, searchValue),
    };

    return (
        <SelectionList
            sections={sections}
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
