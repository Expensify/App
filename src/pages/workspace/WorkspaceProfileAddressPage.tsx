import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import AddressForm from '@components/AddressForm';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {updateAddress} from '@userActions/Policy/Policy';
import type {Country} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {CompanyAddress} from '@src/types/onyx/Policy';
import type {WithPolicyProps} from './withPolicy';
import withPolicy from './withPolicy';

type WorkspaceProfileAddressPagePolicyProps = WithPolicyProps;

type WorkspaceProfileAddressPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ADDRESS> & WorkspaceProfileAddressPagePolicyProps;

function WorkspaceProfileAddressPage({policy, route}: WorkspaceProfileAddressPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const address = useMemo(() => policy?.address, [policy]);
    const [currentCountry, setCurrentCountry] = useState(address?.country);
    const [[street1, street2], setStreets] = useState((address?.addressStreet ?? '').split('\n'));
    const [state, setState] = useState(address?.state);
    const [city, setCity] = useState(address?.city);
    const [zipcode, setZipcode] = useState(address?.zipCode);

    const countryFromUrlTemp = route?.params?.country;
    const countryFromUrl = CONST.ALL_COUNTRIES[countryFromUrlTemp as keyof typeof CONST.ALL_COUNTRIES] ? countryFromUrlTemp : '';

    const updatePolicyAddress = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.HOME_ADDRESS_FORM>) => {
        if (!policy) {
            return;
        }
        updateAddress(policy?.id, {
            addressStreet: `${values.addressLine1?.trim() ?? ''}\n${values.addressLine2?.trim() ?? ''}`,
            city: values.city.trim(),
            state: values.state.trim(),
            zipCode: values?.zipPostCode?.trim().toUpperCase() ?? '',
            country: values.country,
        });
        Navigation.goBack();
    };

    const handleAddressChange = useCallback((value: unknown, key: unknown) => {
        const countryValue = value as Country | '';
        const addressKey = key as keyof CompanyAddress;

        if (addressKey !== 'country' && addressKey !== 'state' && addressKey !== 'city' && addressKey !== 'zipCode') {
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

    useEffect(() => {
        if (!address) {
            return;
        }
        setStreets((address?.addressStreet ?? '').split('\n'));
        setState(address.state);
        setCurrentCountry(address.country);
        setCity(address.city);
        setZipcode(address.zipCode);
    }, [address]);

    useEffect(() => {
        if (!countryFromUrl) {
            return;
        }
        handleAddressChange(countryFromUrl, 'country');
    }, [countryFromUrl, handleAddressChange]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={WorkspaceProfileAddressPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('common.companyAddress')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
            />
            <View style={[styles.ph5, styles.mv3, styles.flexRow, styles.flexWrap]}>
                <Text>{translate('workspace.editor.addressContext')}</Text>
            </View>
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
