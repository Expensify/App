import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import AddressForm from '@components/AddressForm';
import useLocalize from '@hooks/useLocalize';
import * as FormActions from '@libs/actions/FormActions';
import type {SettingsNavigatorParamList} from '@navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {GetPhysicalCardForm} from '@src/types/form';
import BaseGetPhysicalCard from './BaseGetPhysicalCard';
import type {RenderContentProps} from './BaseGetPhysicalCard';

type GetPhysicalCardAddressOnyxProps = {
    /** Draft values used by the get physical card form */
    draftValues: OnyxEntry<GetPhysicalCardForm>;
};

type GetPhysicalCardAddressProps = GetPhysicalCardAddressOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.ADDRESS>;

function GetPhysicalCardAddress({
    draftValues,
    route: {
        params: {country: countryFromUrl, domain},
    },
}: GetPhysicalCardAddressProps) {
    const {translate} = useLocalize();

    const {addressLine1 = '', addressLine2 = '', city = '', state = '', zipPostCode = '', country = ''} = draftValues ?? {};

    useEffect(() => {
        if (!countryFromUrl) {
            return;
        }
        FormActions.setDraftValues(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM, {country: countryFromUrl});
    }, [countryFromUrl]);

    const renderContent = useCallback(
        ({onSubmit, submitButtonText}: RenderContentProps) => (
            <AddressForm
                formID={ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM}
                onSubmit={onSubmit}
                submitButtonText={submitButtonText}
                city={city}
                country={country}
                shouldSaveDraft
                state={state}
                street1={addressLine1}
                street2={addressLine2}
                zip={zipPostCode}
            />
        ),
        [addressLine1, addressLine2, city, country, state, zipPostCode],
    );

    return (
        <BaseGetPhysicalCard
            currentRoute={ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_ADDRESS.getRoute(domain)}
            domain={domain}
            headline={translate('getPhysicalCard.addressMessage')}
            renderContent={renderContent}
            submitButtonText={translate('getPhysicalCard.next')}
            title={translate('getPhysicalCard.header')}
        />
    );
}

GetPhysicalCardAddress.displayName = 'GetPhysicalCardAddress';

export default withOnyx<GetPhysicalCardAddressProps, GetPhysicalCardAddressOnyxProps>({
    draftValues: {
        key: ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM_DRAFT,
    },
})(GetPhysicalCardAddress);
