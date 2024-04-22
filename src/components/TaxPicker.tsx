import React, {useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {EdgeInsets} from 'react-native-safe-area-context';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import SelectionList from './SelectionList';
import RadioListItem from './SelectionList/RadioListItem';

type TaxPickerOnyxProps = {
    /** The policy which the user has access to and which the report is tied to */
    policy: OnyxEntry<Policy>;
};

type TaxPickerProps = TaxPickerOnyxProps & {
    /** The selected tax rate of an expense */
    selectedTaxRate?: string;

    /** ID of the policy */
    // eslint-disable-next-line react/no-unused-prop-types
    policyID?: string;

    /**
     * Safe area insets required for reflecting the portion of the view,
     * that is not covered by navigation bars, tab bars, toolbars, and other ancestor views.
     */
    insets?: EdgeInsets;

    /** Callback to fire when a tax is pressed */
    onSubmit: (tax: OptionsListUtils.TaxRatesOption) => void;
};

function TaxPicker({selectedTaxRate = '', policy, insets, onSubmit}: TaxPickerProps) {
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const [searchValue, setSearchValue] = useState('');

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
                name: selectedTaxRate,
                enabled: true,
                accountID: null,
            },
        ];
    }, [selectedTaxRate]);

    const sections = useMemo(() => OptionsListUtils.getTaxRatesSection(taxRates, selectedOptions as OptionsListUtils.Category[], searchValue), [taxRates, searchValue, selectedOptions]);

    const headerMessage = OptionsListUtils.getHeaderMessageForNonUserList(sections[0].data.length > 0, searchValue);

    const selectedOptionKey = useMemo(() => sections?.[0]?.data?.find((taxRate) => taxRate.searchText === selectedTaxRate)?.keyForList, [sections, selectedTaxRate]);

    return (
        <SelectionList
            sections={sections}
            headerMessage={headerMessage}
            textInputValue={searchValue}
            textInputLabel={shouldShowTextInput ? translate('common.search') : undefined}
            onChangeText={setSearchValue}
            onSelectRow={onSubmit}
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
})(TaxPicker);
