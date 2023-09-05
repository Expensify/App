import React, {useState, useMemo, useCallback} from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import Navigation from '../../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import compose from '../../../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import {withNetwork} from '../../../../components/OnyxProvider';
import SelectionList from '../../../../components/SelectionList';
import searchCountryOptions from '../../../../libs/searchCountryOptions';
import StringUtils from '../../../../libs/StringUtils';

import useLocalize from '../../../../hooks/useLocalize';

/**
 * IOU Currency selection for selecting currency
 */
const propTypes = {
    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** Currently selected country */
            country: PropTypes.string,

            /** Route to navigate back after selecting a currency */
            backTo: PropTypes.string,
        }),
    }).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {};

function CountrySelection(props) {
    const [searchValue, setSearchValue] = useState('');
    const {translate} = useLocalize();
    const currentCountry = lodashGet(props, 'route.params.country');

    const countries = useMemo(
        () =>
            _.map(translate('allCountries'), (countryName, countryISO) => ({
                value: countryISO,
                keyForList: countryISO,
                text: countryName,
                isSelected: currentCountry === countryISO,
                searchValue: StringUtils.sanitizeString(`${countryISO}${countryName}`),
            })),
        [translate, currentCountry],
    );

    const searchResults = searchCountryOptions(searchValue, countries);
    const headerMessage = searchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '';

    const selectCountry = useCallback(
        (option) => {
            const currentCountryInner = option.value;
            const backTo = lodashGet(props.route, 'params.backTo', '');
            const backToRoute = backTo ? `${backTo}?country=${currentCountryInner}` : '';
            Navigation.goBack(backToRoute, true);
        },
        [props.route],
    );

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={translate('common.country')}
                shouldShowBackButton
                onBackButtonPress={() => {
                    const backTo = lodashGet(props.route, 'params.backTo', '');
                    const backToRoute = backTo ? `${backTo}?country=${currentCountry}` : '';
                    Navigation.goBack(backToRoute);
                }}
            />

            <SelectionList
                headerMessage={headerMessage}
                textInputLabel={translate('common.country')}
                textInputValue={searchValue}
                sections={[{data: searchResults, indexOffset: 0}]}
                onSelectRow={selectCountry}
                onChangeText={setSearchValue}
                shouldDelayFocus
                initiallyFocusedOptionKey={currentCountry}
            />
        </ScreenWrapper>
    );
}

CountrySelection.displayName = 'CountrySelection';
CountrySelection.propTypes = propTypes;
CountrySelection.defaultProps = defaultProps;

export default compose(
    withLocalize,

    withNetwork(),
)(CountrySelection);
