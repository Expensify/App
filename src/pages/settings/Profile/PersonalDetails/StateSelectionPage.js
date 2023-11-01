import {CONST as COMMON_CONST} from 'expensify-common/lib/CONST';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useMemo, useState} from 'react';
import _ from 'underscore';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import searchCountryOptions from '@libs/searchCountryOptions';
import StringUtils from '@libs/StringUtils';
import {appendParam} from '@libs/Url';
import styles from '@styles/styles';

const propTypes = {
    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** Currently selected state */
            state: PropTypes.string,

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

function StateSelectionPage({route, navigation}) {
    const [searchValue, setSearchValue] = useState('');
    const {translate} = useLocalize();
    const currentState = lodashGet(route, 'params.state');
    const stateParamName = lodashGet(route, 'params.stateParamName') || 'state';
    const label = lodashGet(route, 'params.label');

    const countryStates = useMemo(
        () =>
            _.map(_.keys(COMMON_CONST.STATES), (state) => {
                const stateName = translate(`allStates.${state}.stateName`);
                const stateISO = translate(`allStates.${state}.stateISO`);
                return {
                    value: stateISO,
                    keyForList: stateISO,
                    text: stateName,
                    isSelected: currentState === stateISO,
                    searchValue: StringUtils.sanitizeString(`${stateISO}${stateName}`),
                };
            }),
        [translate, currentState],
    );

    const searchResults = searchCountryOptions(searchValue, countryStates);
    const headerMessage = searchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '';

    const selectCountryState = useCallback(
        (option) => {
            const backTo = lodashGet(route, 'params.backTo', '');

            // Check the navigation state and "backTo" parameter to decide navigation behavior
            if (navigation.getState().routes.length === 1 && _.isEmpty(backTo)) {
                // If there is only one route and "backTo" is empty, go back in navigation
                Navigation.goBack();
            } else if (!_.isEmpty(backTo) && navigation.getState().routes.length === 1) {
                // If "backTo" is not empty and there is only one route, go back to the specific route defined in "backTo" with a country parameter
                Navigation.goBack(appendParam(backTo, stateParamName, option.value));
            } else {
                // Otherwise, navigate to the specific route defined in "backTo" with a country parameter
                Navigation.navigate(appendParam(backTo, stateParamName, option.value));
            }
        },
        [route, navigation, stateParamName],
    );

    return (
        <ScreenWrapper
            testID={StateSelectionPage.displayName}
            includeSafeAreaPaddingBottom={false}
            style={[styles.pb0]}
            includePaddingTop={false}
        >
            <HeaderWithBackButton
                title={label || translate('common.state')}
                shouldShowBackButton
                onBackButtonPress={() => {
                    const backTo = lodashGet(route, 'params.backTo', '');
                    let backToRoute = '';

                    if (backTo) {
                        backToRoute = appendParam(backTo, stateParamName, currentState);
                    }

                    Navigation.goBack(backToRoute);
                }}
            />

            <SelectionList
                onSelectRow={selectCountryState}
                headerMessage={headerMessage}
                textInputLabel={label || translate('common.state')}
                textInputValue={searchValue}
                sections={[{data: searchResults, indexOffset: 0}]}
                onChangeText={setSearchValue}
                initiallyFocusedOptionKey={currentState}
            />
        </ScreenWrapper>
    );
}

StateSelectionPage.displayName = 'StateSelectionPage';
StateSelectionPage.propTypes = propTypes;

export default StateSelectionPage;
