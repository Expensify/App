import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo, useState} from 'react';
import AddressForm from '@components/AddressForm';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {updateAddress} from '@userActions/Policy';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {CompanyAddress} from '@src/types/onyx/Policy';
import type {WithPolicyProps} from './withPolicy';
import withPolicy from './withPolicy';

type WorkspaceProfileAddressPagePolicyProps = WithPolicyProps;

type WorkspaceProfileAddressPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ADDRESS> & WorkspaceProfileAddressPagePolicyProps;

function WorkspaceProfileAddressPage({policy}: WorkspaceProfileAddressPageProps) {
    const {translate} = useLocalize();
    const address = useMemo(() => policy?.address, [policy]);
    const [currentCountry, setCurrentCountry] = useState(address?.country);
    const [street1, street2] = (address?.street ?? '').split('\n');
    const [state, setState] = useState(address?.state);
    const [city, setCity] = useState(address?.city);
    const [zipcode, setZipcode] = useState(address?.zip);

    const updatePolicyAddress = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.HOME_ADDRESS_FORM>) => {
        if (!policy) {
            return;
        }
        updateAddress(policy?.id, {
            street: values.addressLine1?.trim() ?? '',
            street2: values.addressLine2?.trim() ?? '',
            city: values.city.trim(),
            state: values.state.trim(),
            zip: values?.zipPostCode?.trim().toUpperCase() ?? '',
            country: values.country,
        });
    };

    const handleAddressChange = useCallback((value: unknown, key: unknown) => {
        const countryValue = value as Country | '';
        const addressKey = key as keyof CompanyAddress;

        if (addressKey !== 'country' && addressKey !== 'state' && addressKey !== 'city' && addressKey !== 'zip') {
            return;
        }
        if (addressKey === 'country') {
            setCurrentCountry(countryValue);
            setState('');
            setCity('');
            setZipcode('');
            return;
        }
        if (addressKey === 'state') {
            setState(countryValue);
            setCity('');
            setZipcode('');
            return;
        }
        if (addressKey === 'city') {
            setCity(countryValue);
            setZipcode('');
            return;
        }
        setZipcode(countryValue);
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={WorkspaceProfileAddressPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.editor.addressInputLabel')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
            />
            <AddressForm
                formID={ONYXKEYS.FORMS.HOME_ADDRESS_FORM}
                onSubmit={updatePolicyAddress}
                submitButtonText={translate('common.save')}
                city={city}
                country={currentCountry}
                onAddressChanged={handleAddressChange}
                state={state}
                street1={street1}
                street2={street2}
                zip={zipcode}
            />
        </ScreenWrapper>
    );
}

WorkspaceProfileAddressPage.displayName = 'WorkspaceProfileAddressPage';

export default withPolicy(WorkspaceProfileAddressPage);
