import _ from 'underscore';
import React, {useState, useMemo} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import * as PersonalDetails from '../libs/actions/PersonalDetails';
import ROUTES from '../ROUTES';
import Navigation from '../libs/Navigation/Navigation';
import useLocalize from '../hooks/useLocalize';
import ONYXKEYS from '../ONYXKEYS';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import SelectionListRadio from '../components/SelectionListRadio';
import useNavigationStorage from '../hooks/useNavigationStorage';

const propTypes = {
    route: PropTypes.shape({
        params: PropTypes.shape({
            backTo: PropTypes.string,
            key: PropTypes.string,
        }),
    }).isRequired,

    /** User's private personal details */
    privatePersonalDetails: PropTypes.shape({
        /** User's home address */
        address: PropTypes.shape({
            country: PropTypes.string,
        }),
    }),
};

const defaultProps = {
    privatePersonalDetails: {
        address: {
            state: '',
        },
    },
};

function filterOptions(searchValue, data) {
    const trimmedSearchValue = searchValue.trim();
    if (trimmedSearchValue.length === 0) {
        return [];
    }

    return _.filter(data, (country) => country.text.toLowerCase().includes(searchValue.toLowerCase()));
}

function CountrySelectorPage(props) {
    const {translate} = useLocalize();
    const route = props.route;
    const [collect, dispatch] = useNavigationStorage(route.params.key, null);
    const currentCountry = collect();
    const selectedSearchCountry = PersonalDetails.getCountryName(currentCountry);
    const [searchValue, setSearchValue] = useState(selectedSearchCountry);

    const countries = useMemo(
        () =>
            _.map(translate('allCountries'), (countryName, countryISO) => ({
                value: countryISO,
                keyForList: countryISO,
                text: countryName,
                isSelected: currentCountry === countryISO,
            })),
        [translate, currentCountry],
    );

    const filteredData = filterOptions(searchValue, countries);
    const headerMessage = searchValue.trim() && !filteredData.length ? translate('common.noResultsFound') : '';

    const updateCountry = (selectedCountry) => {
        dispatch(selectedCountry.value);
        Navigation.navigate(`${ROUTES.SETTINGS_PERSONAL_DETAILS_ADDRESS}`, 'NAVIGATE');
    };

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={translate('common.country')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack(`${route.params.backTo}`)}
            />
            <SelectionListRadio
                headerMessage={headerMessage}
                textInputLabel={translate('common.country')}
                textInputPlaceholder={translate('pronounsPage.placeholderText')}
                textInputValue={searchValue}
                sections={[{data: filteredData, indexOffset: 0}]}
                onSelectRow={updateCountry}
                onChangeText={setSearchValue}
                shouldFocusOnSelectRow
                shouldHaveOptionSeparator
                shouldDelayFocus
                initiallyFocusedOptionKey={currentCountry}
            />
        </ScreenWrapper>
    );
}

CountrySelectorPage.propTypes = propTypes;
CountrySelectorPage.defaultProps = defaultProps;
CountrySelectorPage.displayName = 'CountrySelectorPage';

export default withOnyx({
    privatePersonalDetails: {
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    },
})(CountrySelectorPage);
