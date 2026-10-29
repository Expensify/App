import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import FormHeader from '@components/Form/Layout/FormHeader';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {setTravelProvisioningTaxID} from '@libs/actions/Travel';

import type {EnableTravelSubPageProps} from '@pages/Travel/EnableTravel/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/TravelLegalEntityTaxIDForm';

import React from 'react';

function TaxIDStep({onNext}: EnableTravelSubPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.TRAVEL_LEGAL_ENTITY_TAX_ID_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.TRAVEL_LEGAL_ENTITY_TAX_ID_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.TRAVEL_LEGAL_ENTITY_TAX_ID_FORM> = {};
        if (!values[INPUT_IDS.TAX_ID]?.trim()) {
            errors[INPUT_IDS.TAX_ID] = translate('travel.taxID.error.required');
        }
        return errors;
    };

    const handleSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.TRAVEL_LEGAL_ENTITY_TAX_ID_FORM>) => {
        setTravelProvisioningTaxID(values[INPUT_IDS.TAX_ID].trim());
        onNext();
    };

    return (
        <FormProvider
            style={[styles.flexGrow1, styles.mh5]}
            formID={ONYXKEYS.FORMS.TRAVEL_LEGAL_ENTITY_TAX_ID_FORM}
            validate={validate}
            onSubmit={handleSubmit}
            submitButtonText={translate('common.next')}
            enabledWhenOffline
        >
            <FormHeader
                title={translate('travel.taxID.headline')}
                description={translate('travel.taxID.subtitle')}
            />
            <InputWrapper
                InputComponent={TextInput}
                inputID={INPUT_IDS.TAX_ID}
                label={translate('travel.taxID.inputLabel')}
                aria-label={translate('travel.taxID.inputLabel')}
                role={CONST.ROLE.PRESENTATION}
                ref={inputCallbackRef}
            />
        </FormProvider>
    );
}

export default TaxIDStep;
