import AddressForm from '@components/AddressForm';
import type {FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';

import {normalizeCountryCode} from '@libs/CountryUtils';
import {getCurrentAddress} from '@libs/PersonalDetailsUtils';

import {setDraftValues} from '@userActions/FormActions';

import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/HomeAddressForm';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';

import React, {useState} from 'react';
import {View} from 'react-native';

type AddressStepProps = SubPageProps & {
    /** Whether to persist field values as draft on keystroke */
    shouldSaveDraft?: boolean;

    /** Whether to hide the country selector (e.g. when country cannot be changed) */
    shouldHideCountrySelector?: boolean;

    /** Whether the form submit button should be enabled when offline */
    enabledWhenOffline?: boolean;
};

function AddressStep({onNext, isEditing, shouldSaveDraft = false, shouldHideCountrySelector = false, enabledWhenOffline}: AddressStepProps) {
    const styles = useThemeStyles();

    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [defaultCountry] = useOnyx(ONYXKEYS.COUNTRY);
    const [bankAccountPersonalDetails] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT);
    const [homeAddressFormDraft] = useOnyx(ONYXKEYS.FORMS.HOME_ADDRESS_FORM_DRAFT);

    const normalizedAddress = normalizeCountryCode(getCurrentAddress(privatePersonalDetails)) as Address;
    const address = {
        street: bankAccountPersonalDetails?.addressStreet ? `${bankAccountPersonalDetails?.addressStreet}\n${bankAccountPersonalDetails?.addressStreet2}` : (normalizedAddress?.street ?? ''),
        city: bankAccountPersonalDetails?.addressCity ?? normalizedAddress?.city ?? '',
        state: bankAccountPersonalDetails?.addressState ?? normalizedAddress?.state ?? '',
        zip: bankAccountPersonalDetails?.addressZipCode ?? normalizedAddress?.zip ?? '',
        country: (bankAccountPersonalDetails?.country ?? normalizedAddress?.country ?? '') as Country | '',
    };

    const draftCountry = shouldSaveDraft ? homeAddressFormDraft?.country : undefined;
    const draftState = shouldSaveDraft ? homeAddressFormDraft?.state : undefined;
    const {translate} = useLocalize();

    // Check if country is valid
    const {street} = address ?? {};
    const [street1, street2] = street ? street.split('\n') : [undefined, undefined];
    // Store only user edits; untouched fields are derived from the latest saved address and draft.
    const [addressEdits, setAddressEdits] = useState<Partial<Pick<Address, 'country' | 'state' | 'city' | 'zip'>>>({});
    const currentCountry = addressEdits.country ?? draftCountry ?? address.country ?? defaultCountry ?? CONST.COUNTRY.US;
    const state = addressEdits.state ?? draftState ?? address.state;
    const city = addressEdits.city ?? address.city;
    const zipcode = addressEdits.zip ?? address.zip;

    const handleAddressChange = (value: unknown, key: unknown) => {
        const addressPart = value as string;
        const addressPartKey = key as keyof Address;

        if (addressPartKey !== INPUT_IDS.COUNTRY && addressPartKey !== INPUT_IDS.STATE && addressPartKey !== INPUT_IDS.CITY && addressPartKey !== INPUT_IDS.ZIP_POST_CODE) {
            return;
        }
        if (addressPartKey === INPUT_IDS.COUNTRY && addressPart !== currentCountry) {
            setAddressEdits((previousEdits) => ({...previousEdits, country: addressPart as Country | '', state: '', city: '', zip: ''}));
            return;
        }
        if (addressPartKey === INPUT_IDS.STATE) {
            setAddressEdits((previousEdits) => ({...previousEdits, state: addressPart, city: '', zip: ''}));
            return;
        }
        if (addressPartKey === INPUT_IDS.CITY) {
            setAddressEdits((previousEdits) => ({...previousEdits, city: addressPart, zip: ''}));
            return;
        }
        setAddressEdits((previousEdits) => ({...previousEdits, zip: addressPart}));
    };

    const updateAddress = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.HOME_ADDRESS_FORM>) => {
        const submittedAddress = {
            addressStreet: values.addressLine1?.trim() ?? '',
            addressStreet2: values.addressLine2?.trim() ?? '',
            addressCity: values.city?.trim() ?? '',
            addressState: values.state?.trim() ?? '',
            addressZipCode: values?.zipPostCode?.trim().toUpperCase() ?? '',
            country: currentCountry,
        };
        setDraftValues(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM, submittedAddress);
        onNext(submittedAddress);
    };

    return (
        <>
            <View style={[styles.mh5, styles.mb6]}>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('personalInfoStep.whatsYourAddress')}</Text>
                <Text style={[styles.textSupporting]}>{translate('personalInfoStep.addressSubtitle')}</Text>
            </View>
            <AddressForm
                formID={ONYXKEYS.FORMS.HOME_ADDRESS_FORM}
                onSubmit={updateAddress}
                submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
                city={city}
                country={currentCountry as unknown as Country}
                onAddressChanged={handleAddressChange}
                state={state}
                street1={street1}
                street2={street2}
                zip={zipcode}
                shouldSaveDraft={shouldSaveDraft}
                shouldHideCountrySelector={shouldHideCountrySelector}
                enabledWhenOffline={enabledWhenOffline}
                shouldValidatePhysicalAddress
            />
        </>
    );
}

AddressStep.displayName = 'AddressStep';

export default AddressStep;
