import _ from 'underscore';
import React, {useState, useMemo} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import SelectionListRadio from '../components/SelectionListRadio';
import useNavigationStorage from '../hooks/useNavigationStorage';
import Navigation from '../libs/Navigation/Navigation';
import useLocalize from '../hooks/useLocalize';
import ONYXKEYS from '../ONYXKEYS';

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
            state: PropTypes.string,
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

function StateSelectorPage(props) {
    const {translate} = useLocalize();
    const route = props.route;
    const [collect, dispatch] = useNavigationStorage(route.params.key, null);
    const currentCountryState = collect();
    const allStates = translate('allStates');
    const selectedSearchState = !_.isEmpty(currentCountryState) ? allStates[currentCountryState].stateName : '';
    const [searchValue, setSearchValue] = useState(selectedSearchState);

    const countryStates = useMemo(
        () =>
            _.map(translate('allStates'), (state) => ({
                value: state.stateISO,
                keyForList: state.stateISO,
                text: state.stateName,
                isSelected: currentCountryState === state.stateISO,
            })),
        [translate, currentCountryState],
    );

    const filteredData = filterOptions(searchValue, countryStates);
    const headerMessage = searchValue.trim() && !filteredData.length ? translate('common.noResultsFound') : '';

    const updateCountryState = (selectedState) => {
        dispatch(selectedState.value);
        Navigation.goBack(`${decodeURIComponent(route.params.backTo)}`);
    };

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={translate('common.state')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack(`${route.params.backTo}`)}
            />
            <SelectionListRadio
                headerMessage={headerMessage}
                textInputLabel={translate('common.state')}
                textInputPlaceholder={translate('pronounsPage.placeholderText')}
                textInputValue={searchValue}
                sections={[{data: filteredData, indexOffset: 0}]}
                onSelectRow={updateCountryState}
                onChangeText={setSearchValue}
                shouldFocusOnSelectRow
                shouldHaveOptionSeparator
                shouldDelayFocus
                initiallyFocusedOptionKey={currentCountryState}
            />
        </ScreenWrapper>
    );
}

StateSelectorPage.propTypes = propTypes;
StateSelectorPage.defaultProps = defaultProps;
StateSelectorPage.displayName = 'StateSelectorPage';

export default withOnyx({
    privatePersonalDetails: {
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    },
})(StateSelectorPage);
