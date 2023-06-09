import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {useCallback, useMemo} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ROUTES from '../ROUTES';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import Navigation from '../libs/Navigation/Navigation';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
import OptionsSelectorWithSearch, {greenCheckmark} from '../components/OptionsSelectorWithSearch';

const propTypes = {
    route: PropTypes.shape({
        params: PropTypes.shape({
            backTo: PropTypes.string,
        }),
    }).isRequired,

    /** User's private personal details */
    privatePersonalDetails: PropTypes.shape({
        /** User's home address */
        address: PropTypes.shape({
            country: PropTypes.string,
        }),
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    privatePersonalDetails: {
        address: {
            state: '',
        },
    },
};

function CountrySelectorPage(props) {
    const translate = props.translate;
    const route = props.route;
    const currentCountry = route.params.countryISO || lodashGet(props.privatePersonalDetails, 'address.country');

    const countries = useMemo(
        () =>
            _.map(translate('allCountries'), (countryName, countryISO) => ({
                value: countryISO,
                keyForList: countryISO,
                text: countryName,
                customIcon: currentCountry === countryISO ? greenCheckmark : undefined,
            })),
        [translate, currentCountry],
    );

    const updateCountry = useCallback((selectedCountry) => {
        Navigation.goBack(`${ROUTES.SETTINGS_PERSONAL_DETAILS_ADDRESS}?countryISO=${selectedCountry.value}`, true);
    }, []);

    return (
        <OptionsSelectorWithSearch
            data={countries}
            title={translate('common.country')}
            onBackButtonPress={() => Navigation.goBack(`${route.params.backTo}`)}
            textSearchLabel={translate('common.country')}
            placeholder={translate('pronounsPage.placeholderText')}
            onSelectRow={updateCountry}
            initialOption={currentCountry}
        />
    );
}

CountrySelectorPage.propTypes = propTypes;
CountrySelectorPage.defaultProps = defaultProps;
CountrySelectorPage.displayName = 'CountrySelectorPage';

export default compose(
    withLocalize,
    withOnyx({
        privatePersonalDetails: {
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
        },
    }),
)(CountrySelectorPage);
