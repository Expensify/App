import DropdownChoiceAdapter from '@components/DynamicForm/adapters/DropdownChoiceAdapter';
import {getCountryChoices} from '@components/DynamicForm/utils/getFieldOptions';
import InputWrapper from '@components/Form/InputWrapper';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {useAddressFields} from '@pages/ReimbursementAccount/AddressFormFields/AddressFields';

import React from 'react';
import {View} from 'react-native';

type DynamicFormAddressCountryDropdownProps = {
    /** Dims the row and stops it opening, e.g. while offline for a country that asks the server for new requirements */
    disabled?: boolean;

    /** Codes of the countries to list, in place of every country */
    countries?: string[];
};

/** The country of a DynamicForm address, drawn as the same dropdown row as the form's other choice fields. A new country clears the state, which belongs to the old one */
function DynamicFormAddressCountryDropdown({disabled = false, countries}: DynamicFormAddressCountryDropdownProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputKeys, values, defaultValues, shouldSaveDraft, changeCountry, forwardedFSClass} = useAddressFields();
    const countryChoices = getCountryChoices(translate);

    return (
        // The rows sit as far apart as the form spaces any two inputs
        <View style={styles.mt4}>
            <InputWrapper
                InputComponent={DropdownChoiceAdapter}
                inputID={inputKeys.country ?? 'country'}
                shouldSaveDraft={shouldSaveDraft}
                items={countries ? countryChoices.filter((choice) => countries.includes(choice.value)) : countryChoices}
                label={translate('common.country')}
                title={translate('countryStep.selectCountry')}
                value={values?.country}
                defaultValue={defaultValues?.country}
                onValueChange={changeCountry}
                stateInputIDToReset={inputKeys.state ?? 'stateInput'}
                disabled={disabled}
                forwardedFSClass={forwardedFSClass}
            />
        </View>
    );
}

export default DynamicFormAddressCountryDropdown;
