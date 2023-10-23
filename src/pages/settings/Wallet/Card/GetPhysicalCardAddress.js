import PropTypes from 'prop-types';
import React, {useCallback, useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import AddressForm from '../../../../components/AddressForm';
import useLocalize from '../../../../hooks/useLocalize';
import ONYXKEYS from '../../../../ONYXKEYS';
import BaseGetPhysicalCard from './BaseGetPhysicalCard';
import * as FormActions from '../../../../libs/actions/FormActions';
import FormUtils from '../../../../libs/FormUtils';

const propTypes = {
    /* Onyx Props */
    /** Draft values used by the get physical card form */
    draftValues: PropTypes.shape({
        // User home address
        address: PropTypes.string,
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
        }),
    }).isRequired,
};

const defaultProps = {
    draftValues: {
        address: '',
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
        params: {country: countryFromUrl},
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
