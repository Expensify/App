import React, {useState, useMemo, useCallback} from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import Navigation from '../../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import SelectionList from '../../../../components/SelectionList';
import searchCountryOptions from '../../../../libs/searchCountryOptions';
import StringUtils from '../../../../libs/StringUtils';
import CONST from '../../../../CONST';
import useLocalize from '../../../../hooks/useLocalize';

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

    /** Navigation from react-navigation */
    navigation: PropTypes.shape({
        /** getState function retrieves the current navigation state from react-navigation's navigation property */
        getState: PropTypes.func.isRequired,
    }).isRequired,
};

function CountrySelectionPage({route, navigation}) {
    const [searchValue, setSearchValue] = useState('');
    const {translate} = useLocalize();
    const currentCountry = lodashGet(route, 'params.country');

    const countries = useMemo(
        () =>
            _.map(_.keys(CONST.ALL_COUNTRIES), (countryISO) => {
                const countryName = translate(`allCountries.${countryISO}`);
                return {
                    value: countryISO,
                    keyForList: countryISO,
                    text: countryName,
                    isSelected: currentCountry === countryISO,
                    searchValue: StringUtils.sanitizeString(`${countryISO}${countryName}`),
                };
            }),
        [translate, currentCountry],
    );

    const searchResults = searchCountryOptions(searchValue, countries);
    const headerMessage = searchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '';

    const selectCountry = useCallback(
        (option) => {
            const backTo = lodashGet(route, 'params.backTo', '');

            // Check the navigation state and "backTo" parameter to decide navigation behavior
            if (navigation.getState().routes.length === 1 && _.isEmpty(backTo)) {
                // If there is only one route and "backTo" is empty, go back in navigation
                Navigation.goBack();
            } else if (!_.isEmpty(backTo) && navigation.getState().routes.length === 1) {
                // If "backTo" is not empty and there is only one route, go back to the specific route defined in "backTo" with a country parameter
                Navigation.goBack(`${route.params.backTo}?country=${option.value}`);
            } else {
                // Otherwise, navigate to the specific route defined in "backTo" with a country parameter
                Navigation.navigate(`${route.params.backTo}?country=${option.value}`);
            }
        },
        [route, navigation],
    );

    return (
        <ScreenWrapper
            testID={CountrySelectionPage.displayName}
            includeSafeAreaPaddingBottom={false}
        >
            <HeaderWithBackButton
                title={translate('common.country')}
                shouldShowBackButton
                onBackButtonPress={() => {
                    const backTo = lodashGet(route, 'params.backTo', '');
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
                initiallyFocusedOptionKey={currentCountry}
            />
        </ScreenWrapper>
    );
}

CountrySelectionPage.displayName = 'CountrySelectionPage';
CountrySelectionPage.propTypes = propTypes;

export default CountrySelectionPage;
