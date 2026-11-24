import InputWrapper from '@components/Form/InputWrapper';
import PushRowWithModal from '@components/PushRowWithModal';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import {useAddressFields} from './AddressFieldsProvider';

type AddressStateSelectorProps = {
    /** The states to list, keyed by their code */
    optionsList: Record<string, string>;

    /** Name of the row, "State" unless the caller asks for a province or region */
    label?: string;

    /** Heading of the page the states are listed on, "State" by default */
    modalHeaderTitle?: string;

    /** Label of the search input above the states, "State" by default */
    searchInputTitle?: string;
};

/** The state of an address, picked on a page of its own */
function AddressStateSelector({optionsList, label, modalHeaderTitle, searchInputTitle}: AddressStateSelectorProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputKeys, values, defaultValues, errors, shouldSaveDraft, forwardedFSClass} = useAddressFields();

    return (
        <View style={[styles.mt3, styles.mhn5]}>
            <InputWrapper
                InputComponent={PushRowWithModal}
                optionsList={optionsList}
                shouldSaveDraft={shouldSaveDraft}
                description={label ?? translate('common.state')}
                modalHeaderTitle={modalHeaderTitle ?? translate('common.state')}
                searchInputTitle={searchInputTitle ?? translate('common.state')}
                value={values?.state}
                defaultValue={defaultValues?.state}
                inputID={inputKeys.state ?? 'stateInput'}
                errorText={errors?.state ? translate('bankAccount.error.addressState') : ''}
                forwardedFSClass={forwardedFSClass}
            />
        </View>
    );
}

export default AddressStateSelector;
