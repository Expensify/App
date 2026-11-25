import InputWrapper from '@components/Form/InputWrapper';
import DropdownChoiceAdapter from '@components/FormDropdownField/DropdownChoiceAdapter';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {useAddressFields} from '@pages/ReimbursementAccount/AddressFormFields/AddressFields';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type DynamicFormAddressStateDropdownProps = {
    /** The states of the address's country, keyed by their code */
    stateOptions: Record<string, string>;
};

/** The state of a DynamicForm address, drawn as the same dropdown row as the form's other choice fields */
function DynamicFormAddressStateDropdown({stateOptions}: DynamicFormAddressStateDropdownProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputKeys, values, defaultValues, shouldSaveDraft, forwardedFSClass} = useAddressFields();

    return (
        // The rows sit as far apart as the form spaces any two inputs
        <View style={styles.mt4}>
            <InputWrapper
                InputComponent={DropdownChoiceAdapter}
                sentryLabel={CONST.SENTRY_LABEL.DYNAMIC_FORM.CHOICE_FIELD}
                backButtonSentryLabel={CONST.SENTRY_LABEL.DYNAMIC_FORM.CHOICE_FIELD_BACK}
                inputID={inputKeys.state ?? 'stateInput'}
                shouldSaveDraft={shouldSaveDraft}
                items={Object.entries(stateOptions).map(([value, label]) => ({value, label}))}
                label={translate('common.state')}
                title={translate('common.state')}
                value={values?.state}
                defaultValue={defaultValues?.state}
                forwardedFSClass={forwardedFSClass}
            />
        </View>
    );
}

export default DynamicFormAddressStateDropdown;
