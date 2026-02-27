import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import AddressForm from '@components/AddressForm';
import type {FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {normalizeCountryCode} from '@libs/CountryUtils';
import {getCurrentAddress} from '@libs/PersonalDetailsUtils';
import {setDraftValues} from '@userActions/FormActions';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/HomeAddressForm';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';

function AddressStep({onNext, isEditing}: SubStepProps) {
    const styles = useThemeStyles();

    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});
    const [defaultCountry] = useOnyx(ONYXKEYS.COUNTRY, {canBeMissing: true});
    const [bankAccountPersonalDetails] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {canBeMissing: true});

    const address = useMemo(() => {
        const normalizedAddress = normalizeCountryCode(getCurrentAddress(privatePersonalDetails)) as Address;
        return {
            street: bankAccountPersonalDetails?.addressStreet
                ? `${bankAccountPersonalDetails?.addressStreet}\n${bankAccountPersonalDetails?.addressStreet2}`
                : (normalizedAddress?.street ?? ''),
            city: bankAccountPersonalDetails?.addressCity ?? normalizedAddress?.city ?? '',
            state: bankAccountPersonalDetails?.addressState ?? normalizedAddress?.state ?? '',
            zip: bankAccountPersonalDetails?.addressZipCode ?? normalizedAddress?.zip ?? '',
            country: (bankAccountPersonalDetails?.country ?? normalizedAddress?.country ?? '') as Country | '',
        };
    }, [
        bankAccountPersonalDetails?.addressCity,
        bankAccountPersonalDetails?.addressState,
        bankAccountPersonalDetails?.addressStreet,
        bankAccountPersonalDetails?.addressStreet2,
        bankAccountPersonalDetails?.addressZipCode,
        bankAccountPersonalDetails?.country,
        privatePersonalDetails,
    ]);
    const {translate} = useLocalize();

    // Check if country is valid
    const {street} = address ?? {};
    const [street1, street2] = street ? street.split('\n') : [undefined, undefined];
    const [currentCountry, setCurrentCountry] = useState<string | undefined>(address?.country ?? defaultCountry ?? CONST.COUNTRY.US);
    const [state, setState] = useState<string | undefined>(address?.state);
    const [city, setCity] = useState<string | undefined>(address?.city);
    const [zipcode, setZipcode] = useState<string | undefined>(address?.zip);

    useEffect(() => {
        if (!address) {
            return;
        }
        setState(address?.state);
        setCurrentCountry(address?.country);
        setCity(address?.city);
        setZipcode(address?.zip);
    }, [address?.state, address?.country, address?.city, address?.zip, address]);

    const handleAddressChange = (value: unknown, key: unknown) => {
        const addressPart = value as string;
        const addressPartKey = key as keyof Address;

        if (addressPartKey !== INPUT_IDS.COUNTRY && addressPartKey !== INPUT_IDS.STATE && addressPartKey !== INPUT_IDS.CITY && addressPartKey !== INPUT_IDS.ZIP_POST_CODE) {
            return;
        }
        if (addressPartKey === INPUT_IDS.COUNTRY && addressPart !== currentCountry) {
            setCurrentCountry(addressPart as Country | '');
            setState('');
            setCity('');
            setZipcode('');
            return;
        }
        if (addressPartKey === INPUT_IDS.STATE) {
            setState(addressPart);
            setCity('');
            setZipcode('');
            return;
        }
        if (addressPartKey === INPUT_IDS.CITY) {
            setCity(addressPart);
            setZipcode('');
            return;
        }
        setZipcode(addressPart);
    };

    const updateAddress = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.HOME_ADDRESS_FORM>) => {
        setDraftValues(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM, {
            addressStreet: values.addressLine1?.trim() ?? '',
            addressStreet2: values.addressLine2?.trim() ?? '',
            addressCity: values.city?.trim() ?? '',
            addressState: values.state?.trim() ?? '',
            addressZipCode: values?.zipPostCode?.trim().toUpperCase() ?? '',
            country: currentCountry,
        });
        onNext();
    };

    return (
        <>
            <View style={[styles.mh5, styles.mb6]}>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('personalInfoStep.whatsYourAddress')}</Text>
                <Text style={[styles.textSupporting]}>{translate('common.noPO')}</Text>
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
            />
        </>
    );
}

AddressStep.displayName = 'AddressStep';

export default AddressStep;
