import React, {useCallback, useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {EdgeInsets} from 'react-native-safe-area-context';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import * as IOUUtils from '@libs/IOUUtils';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {IOUAction} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import SelectionList from './SelectionList';
import RadioListItem from './SelectionList/RadioListItem';

type TaxPickerOnyxProps = {
    /** The policy which the user has access to and which the report is tied to */
    policy: OnyxEntry<Policy>;

    /** All the data for the transaction */
    transaction: OnyxEntry<Transaction>;

    /** The draft transaction that holds data to be persisted on the current split transaction */
    splitDraftTransaction: OnyxEntry<Transaction>;
};

type TaxPickerProps = TaxPickerOnyxProps & {
    /** The selected tax rate of an expense */
    selectedTaxRate?: string;

    /** ID of the policy */
    // eslint-disable-next-line react/no-unused-prop-types
    policyID?: string;

    /** ID of the transaction */
    // eslint-disable-next-line react/no-unused-prop-types
    transactionID?: string;

    /**
     * Safe area insets required for reflecting the portion of the view,
     * that is not covered by navigation bars, tab bars, toolbars, and other ancestor views.
     */
    insets?: EdgeInsets;

    /** Callback to fire when a tax is pressed */
    onSubmit: (tax: OptionsListUtils.TaxRatesOption) => void;

    /** The action to take */
    // eslint-disable-next-line react/no-unused-prop-types
    action?: IOUAction;

    /** The type of IOU */
    iouType?: ValueOf<typeof CONST.IOU.TYPE>;

    onDismiss: () => void;
};

function TaxPicker({selectedTaxRate = '', policy, transaction, insets, onSubmit, action, splitDraftTransaction, iouType, onDismiss}: TaxPickerProps) {
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const [searchValue, setSearchValue] = useState('');

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingSplitBill = isEditing && iouType === CONST.IOU.TYPE.SPLIT;
    const currentTransaction = isEditingSplitBill && !isEmptyObject(splitDraftTransaction) ? splitDraftTransaction : transaction;

    const taxRates = policy?.taxRates;
    const taxRatesCount = TransactionUtils.getEnabledTaxRateCount(taxRates?.taxes ?? {});
    const isTaxRatesCountBelowThreshold = taxRatesCount < CONST.TAX_RATES_LIST_THRESHOLD;

    const shouldShowTextInput = !isTaxRatesCountBelowThreshold;

    const selectedOptions = useMemo(() => {
        if (!selectedTaxRate) {
            return [];
        }

        return [
            {
                modifiedName: selectedTaxRate,
                isDisabled: false,
                accountID: null,
            },
        ];
    }, [selectedTaxRate]);

    const sections = useMemo(
        () => OptionsListUtils.getTaxRatesSection(policy, selectedOptions as OptionsListUtils.Tax[], searchValue, currentTransaction),
        [searchValue, selectedOptions, policy, currentTransaction],
    );

    const headerMessage = OptionsListUtils.getHeaderMessageForNonUserList((sections.at(0)?.data?.length ?? 0) > 0, searchValue);

    const selectedOptionKey = useMemo(() => sections?.at(0)?.data?.find((taxRate) => taxRate.searchText === selectedTaxRate)?.keyForList, [sections, selectedTaxRate]);

    const handleSelectRow = useCallback(
        (newSelectedOption: OptionsListUtils.TaxRatesOption) => {
            if (selectedOptionKey === newSelectedOption.keyForList) {
                onDismiss();
                return;
            }
            onSubmit(newSelectedOption);
        },
        [onSubmit, onDismiss, selectedOptionKey],
    );

    return (
        <SelectionList
            sections={sections}
            headerMessage={headerMessage}
            textInputValue={searchValue}
            textInputLabel={shouldShowTextInput ? translate('common.search') : undefined}
            onChangeText={setSearchValue}
            onSelectRow={handleSelectRow}
            ListItem={RadioListItem}
            initiallyFocusedOptionKey={selectedOptionKey ?? undefined}
            isRowMultilineSupported
            containerStyle={{paddingBottom: StyleUtils.getSafeAreaMargins(insets).marginBottom}}
        />
    );
}

TaxPicker.displayName = 'TaxPicker';

export default withOnyx<TaxPickerProps, TaxPickerOnyxProps>({
    policy: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
    },
    transaction: {
        key: ({transactionID, action}) => {
            if (IOUUtils.shouldUseTransactionDraft(action)) {
                return `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}` as `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`;
            }
            return `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
        },
    },
    splitDraftTransaction: {
        key: ({transactionID}) => `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`,
    },
})(TaxPicker);
