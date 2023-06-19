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
            state: PropTypes.string,
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

function StateSelectorPage(props) {
    const translate = props.translate;
    const route = props.route;
    const currentCountryState = !_.isEmpty(route.params) ? route.params.stateISO : lodashGet(props.privatePersonalDetails, 'address.state');
    const allStates = translate('allStates');
    const selectedSearchState = !_.isEmpty(currentCountryState) ? allStates[currentCountryState].stateName : '';

    const countryStates = useMemo(
        () =>
            _.map(translate('allStates'), (state) => ({
                value: state.stateISO,
                keyForList: state.stateISO,
                text: state.stateName,
                customIcon: currentCountryState === state.stateISO ? greenCheckmark : undefined,
            })),
        [translate, currentCountryState],
    );

    const updateCountryState = useCallback((selectedState) => {
        Navigation.goBack(`${ROUTES.SETTINGS_PERSONAL_DETAILS_ADDRESS}?stateISO=${selectedState.value}`, true);
    }, []);

    return (
        <OptionsSelectorWithSearch
            title={translate('common.state')}
            onBackButtonPress={() => Navigation.goBack(`${route.params.backTo}`)}
            textSearchLabel={translate('common.state')}
            placeholder={translate('pronounsPage.placeholderText')}
            onSelectRow={updateCountryState}
            initialSearchValue={selectedSearchState}
            initialOption={currentCountryState}
            data={countryStates}
        />
    );
}

StateSelectorPage.propTypes = propTypes;
StateSelectorPage.defaultProps = defaultProps;
StateSelectorPage.displayName = 'StateSelectorPage';

export default compose(
    withLocalize,
    withOnyx({
        privatePersonalDetails: {
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
        },
    }),
)(StateSelectorPage);
