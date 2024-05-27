import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AddressPage from '@pages/AddressPage';
import * as PersonalDetails from '@userActions/PersonalDetails';
import type {FormOnyxValues} from '@src/components/Form/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {PrivatePersonalDetails} from '@src/types/onyx';

type PersonalAddressPageOnyxProps = {
    /** User's private personal details */
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;
    /** Whether app is loading */
    isLoadingApp: OnyxEntry<boolean>;
};

type PersonalAddressPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.ADDRESS> & PersonalAddressPageOnyxProps;

/**
 * Submit form to update user's first and last legal name
 * @param values - form input values
 */
function updateAddress(values: FormOnyxValues<typeof ONYXKEYS.FORMS.HOME_ADDRESS_FORM>) {
    PersonalDetails.updateAddress(
        values.addressLine1?.trim() ?? '',
        values.addressLine2?.trim() ?? '',
        values.city.trim(),
        values.state.trim(),
        values?.zipPostCode?.trim().toUpperCase() ?? '',
        values.country,
    );
}

function PersonalAddressPage({privatePersonalDetails, isLoadingApp = true}: PersonalAddressPageProps) {
    const {translate} = useLocalize();
    const address = useMemo(() => privatePersonalDetails?.address, [privatePersonalDetails]);

    return (
        <AddressPage
            address={address}
            isLoadingApp={isLoadingApp}
            updateAddress={updateAddress}
            title={translate('privatePersonalDetails.address')}
        />
    );
}

PersonalAddressPage.displayName = 'PersonalAddressPage';

export default withOnyx<PersonalAddressPageProps, PersonalAddressPageOnyxProps>({
    privatePersonalDetails: {
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    },
    isLoadingApp: {
        key: ONYXKEYS.IS_LOADING_APP,
    },
})(PersonalAddressPage);
