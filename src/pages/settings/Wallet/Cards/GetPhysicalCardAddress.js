import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import AddressForm from '../../../../components/AddressForm';
import useLocalize from '../../../../hooks/useLocalize';
import ONYXKEYS from '../../../../ONYXKEYS';
import BaseGetPhysicalCard from './BaseGetPhysicalCard';

const propTypes = {
    /* Onyx Props */
    /** User's private personal details */
    privatePersonalDetails: PropTypes.shape({
        /** User's home address */
        address: PropTypes.shape({
            street: PropTypes.string,
            city: PropTypes.string,
            state: PropTypes.string,
            zip: PropTypes.string,
            country: PropTypes.string,
        }),
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
    privatePersonalDetails: {
        address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: '',
        },
    },
};

function GetPhysicalCardAddress({privatePersonalDetails, route}) {
    const {translate} = useLocalize();
    const countryFromUrl = lodashGet(route, 'params.country');
    const {street, city, state, zip, country} = lodashGet(privatePersonalDetails, 'address') || {};
    const [street1, street2] = (street || '').split('\n');

    const renderContent = useCallback(
        (onSubmit, submitButtonText) => (
            <AddressForm
                formID={ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM}
                onSubmit={onSubmit}
                submitButtonText={submitButtonText}
                city={city}
                country={countryFromUrl || country}
                state={state}
                street1={street1}
                street2={street2}
                zip={zip}
            />
        ),
        [city, country, countryFromUrl, state, street1, street2, zip],
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
    privatePersonalDetails: {
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    },
})(GetPhysicalCardAddress);
