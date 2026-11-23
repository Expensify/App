import DropdownChoiceAdapter from '@components/DropdownChoiceAdapter';
import {getCountryChoices} from '@components/DynamicForm/utils/getFieldOptions';
import InputWrapper from '@components/Form/InputWrapper';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {useAddressFields} from '@pages/ReimbursementAccount/AddressFormFields/AddressFields';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type DynamicFormAddressCountryDropdownProps = {
    /** Dims the row and stops it opening, e.g. while offline for a country that asks the server for new requirements */
    disabled?: boolean;
};

/** The country of a DynamicForm address, drawn as the same dropdown row as the form's other choice fields. A new country clears the state, which belongs to the old one */
function DynamicFormAddressCountryDropdown({disabled = false}: DynamicFormAddressCountryDropdownProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputKeys, values, defaultValues, shouldSaveDraft, changeCountry, forwardedFSClass} = useAddressFields();

    return (
        // The rows sit as far apart as the form spaces any two inputs
        <View style={styles.mt4}>
            <InputWrapper
                InputComponent={DropdownChoiceAdapter}
                sentryLabel={CONST.SENTRY_LABEL.DYNAMIC_FORM.CHOICE_FIELD}
                backButtonSentryLabel={CONST.SENTRY_LABEL.DYNAMIC_FORM.CHOICE_FIELD_BACK}
                inputID={inputKeys.country ?? 'country'}
                shouldSaveDraft={shouldSaveDraft}
                items={getCountryChoices(translate)}
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
