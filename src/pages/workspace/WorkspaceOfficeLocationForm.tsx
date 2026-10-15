import AddressForm from '@components/AddressForm';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import TextInput from '@components/TextInput';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getWorkspaceAddressStreetLines} from '@libs/WorkspacesSettingsUtils';

import type {Country} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WorkspaceOfficeLocationForm';
import type {CompanyAddress, OfficeLocation} from '@src/types/onyx/Policy';

import React, {useState} from 'react';
import {View} from 'react-native';

type WorkspaceOfficeLocationFormValues = FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_OFFICE_LOCATION_FORM>;

type WorkspaceOfficeLocationFormProps = {
    /** The office being edited, undefined when adding one */
    officeLocation?: OfficeLocation;

    /** Whether "Set as primary" starts checked */
    isPrimary: boolean;

    /** Whether "Set as primary" can't be changed, for an office that has to be the primary one */
    isPrimaryLocked: boolean;

    /** Whether the location name can't be left empty */
    isNameRequired: boolean;

    /** Names of the other locations of the workspace, which the location name can't match regardless of case */
    takenNames: string[];

    /** Called with the trimmed name, the office address and whether the office is the primary one */
    onSubmit: (name: string, address: CompanyAddress, isPrimary: boolean) => void;
};

/** The location name, address and "Set as primary" fields shared by the pages that add and edit workspace offices */
function WorkspaceOfficeLocationForm({officeLocation, isPrimary, isPrimaryLocked, isNameRequired, takenNames, onSubmit}: WorkspaceOfficeLocationFormProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const address = officeLocation?.address;
    const {streetLineOne, streetLineTwo} = getWorkspaceAddressStreetLines(address?.addressStreet, address?.addressStreet2);
    const [currentCountry, setCurrentCountry] = useState<Country | ''>(address?.country ?? '');
    const [state, setState] = useState(address?.state ?? '');
    const [city, setCity] = useState(address?.city ?? '');
    const [zipCode, setZipCode] = useState(address?.zipCode ?? '');

    const handleAddressChange = (value: unknown, key: unknown) => {
        const addressPart = typeof value === 'string' ? value : '';
        if (key === INPUT_IDS.COUNTRY && addressPart !== currentCountry) {
            setCurrentCountry(Object.keys(CONST.ALL_COUNTRIES).find((countryCode): countryCode is Country => countryCode === addressPart) ?? '');
            setState('');
            setCity('');
            setZipCode('');
            return;
        }
        if (key === INPUT_IDS.STATE) {
            setState(addressPart);
            setCity('');
            setZipCode('');
            return;
        }
        if (key === INPUT_IDS.CITY) {
            setCity(addressPart);
            setZipCode('');
            return;
        }
        if (key === INPUT_IDS.ZIP_POST_CODE) {
            setZipCode(addressPart);
        }
    };

    const validate = (values: WorkspaceOfficeLocationFormValues): Record<string, string> => {
        const errors: Record<string, string> = {};
        const name = values[INPUT_IDS.LOCATION_NAME].trim();
        if (isNameRequired && !name) {
            errors[INPUT_IDS.LOCATION_NAME] = translate('common.error.fieldRequired');
        } else if (name.length > CONST.FORM_CHARACTER_LIMIT) {
            errors[INPUT_IDS.LOCATION_NAME] = translate('common.error.characterLimitExceedCounter', name.length, CONST.FORM_CHARACTER_LIMIT);
        } else if (!!name && name !== officeLocation?.name && takenNames.some((takenName) => takenName.trim().toLowerCase() === name.toLowerCase())) {
            // Like the server, only a changed name is checked, so an office whose name was already taken can still save other changes
            errors[INPUT_IDS.LOCATION_NAME] = translate('workspace.officeLocations.existingOfficeLocationError');
        }
        return errors;
    };

    const submit = (values: WorkspaceOfficeLocationFormValues) => {
        const addressLine1 = values[INPUT_IDS.ADDRESS_LINE_1].trim();
        const addressLine2 = values[INPUT_IDS.ADDRESS_LINE_2].trim();
        onSubmit(
            values[INPUT_IDS.LOCATION_NAME].trim(),
            {
                // Offices store both address lines in addressStreet, the same shape the workspace address has
                addressStreet: addressLine2 ? `${addressLine1}\n${addressLine2}` : addressLine1,
                city: values[INPUT_IDS.CITY].trim(),
                state: values[INPUT_IDS.STATE].trim(),
                zipCode: values[INPUT_IDS.ZIP_POST_CODE].trim().toUpperCase(),
                country: values[INPUT_IDS.COUNTRY],
            },
            values[INPUT_IDS.IS_PRIMARY],
        );
    };

    return (
        <AddressForm
            formID={ONYXKEYS.FORMS.WORKSPACE_OFFICE_LOCATION_FORM}
            onSubmit={submit}
            validate={validate}
            submitButtonText={translate('common.save')}
            city={city}
            country={currentCountry}
            onAddressChanged={handleAddressChange}
            state={state}
            street1={streetLineOne}
            street2={streetLineTwo}
            zip={zipCode}
            shouldRequireZip
        >
            <InputWrapper
                InputComponent={TextInput}
                inputID={INPUT_IDS.LOCATION_NAME}
                label={translate('workspace.officeLocations.locationName')}
                aria-label={translate('workspace.officeLocations.locationName')}
                role={CONST.ROLE.PRESENTATION}
                defaultValue={officeLocation?.name}
                hint={translate('workspace.officeLocations.locationNameHint')}
                spellCheck={false}
            />
            <View style={styles.formSpaceVertical} />
            <AddressForm.Fields />
            <View style={styles.formSpaceVertical} />
            <InputWrapper
                InputComponent={CheckboxWithLabel}
                inputID={INPUT_IDS.IS_PRIMARY}
                label={translate('workspace.officeLocations.setAsPrimary')}
                accessibilityLabel={translate('workspace.officeLocations.setAsPrimary')}
                defaultValue={isPrimary}
                disabled={isPrimaryLocked}
            />
        </AddressForm>
    );
}

export default WorkspaceOfficeLocationForm;
