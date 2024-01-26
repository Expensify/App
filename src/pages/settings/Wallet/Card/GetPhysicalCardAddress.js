import PropTypes from 'prop-types';
import React, {useCallback, useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import AddressForm from '@components/AddressForm';
import useLocalize from '@hooks/useLocalize';
import * as FormActions from '@libs/actions/FormActions';
import FormUtils from '@libs/FormUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import BaseGetPhysicalCard from './BaseGetPhysicalCard';

const propTypes = {
    /* Onyx Props */
    /** Draft values used by the get physical card form */
    draftValues: PropTypes.shape({
        // User home address
        addressLine1: PropTypes.string,
        addressLine2: PropTypes.string,
        city: PropTypes.string,
        country: PropTypes.string,
        state: PropTypes.string,
        zipPostCode: PropTypes.string,
    }),

    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** Currently selected country */
            country: PropTypes.string,
            /** domain passed via route /settings/wallet/card/:domain */
            domain: PropTypes.string,
        }),
    }).isRequired,
};

const defaultProps = {
    draftValues: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        country: '',
        state: '',
        zipPostCode: '',
    },
};

function GetPhysicalCardAddress({
    draftValues: {addressLine1, addressLine2, city, state, zipPostCode, country},
    route: {
        params: {country: countryFromUrl, domain},
    },
}) {
    const {translate} = useLocalize();

    useEffect(() => {
        if (!countryFromUrl) {
            return;
        }
        FormActions.setDraftValues(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM, {country: countryFromUrl});
    }, [countryFromUrl]);

    const renderContent = useCallback(
        (onSubmit, submitButtonText) => (
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

GetPhysicalCardAddress.defaultProps = defaultProps;
GetPhysicalCardAddress.displayName = 'GetPhysicalCardAddress';
GetPhysicalCardAddress.propTypes = propTypes;

export default withOnyx({
    draftValues: {
        key: FormUtils.getDraftKey(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM),
    },
})(GetPhysicalCardAddress);
