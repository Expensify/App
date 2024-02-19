import {useNavigation, useRoute} from '@react-navigation/native';
import {CONST as COMMON_CONST} from 'expensify-common/lib/CONST';
import _ from 'lodash';
import React, {useCallback, useMemo, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import searchCountryOptions from '@libs/searchCountryOptions';
import type {CountryData} from '@libs/searchCountryOptions';
import StringUtils from '@libs/StringUtils';
import {appendParam} from '@libs/Url';

type State = keyof typeof COMMON_CONST.STATES;

type RouteParams = {
    state?: string;
    label?: string;
    backTo?: string;
};

function StateSelectionPage() {
    const route = useRoute();
    const navigation = useNavigation();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchValue, setSearchValue] = useState('');

    const params = route.params as RouteParams | undefined; // Type assertion

    const currentState = params?.state;
    const label = params?.label;

    const countryStates = useMemo(
        () =>
            Object.keys(COMMON_CONST.STATES).map((state) => {
                const stateName = translate(`allStates.${state as State}.stateName`);
                const stateISO = translate(`allStates.${state as State}.stateISO`);
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
        (option: CountryData) => {
            const backTo = params?.backTo ?? '';

            // Check the navigation state and "backTo" parameter to decide navigation behavior
            if (navigation.getState().routes.length === 1 && _.isEmpty(backTo)) {
                // If there is only one route and "backTo" is empty, go back in navigation
                Navigation.goBack();
            } else if (!_.isEmpty(backTo) && navigation.getState().routes.length === 1) {
                // If "backTo" is not empty and there is only one route, go back to the specific route defined in "backTo" with a country parameter
                // @ts-expect-error Navigation.goBack does take a param
                Navigation.goBack(appendParam(backTo, 'state', option.value));
            } else {
                // Otherwise, navigate to the specific route defined in "backTo" with a country parameter
                // @ts-expect-error Navigation.navigate does take a param
                Navigation.navigate(appendParam(backTo, 'state', option.value));
            }
        },
        [navigation, params?.backTo],
    );

    return (
        <ScreenWrapper
            testID={StateSelectionPage.displayName}
            includeSafeAreaPaddingBottom={false}
            style={[styles.pb0]}
            includePaddingTop={false}
        >
            <HeaderWithBackButton
                // Label can be an empty string
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                title={label || translate('common.state')}
                shouldShowBackButton
                onBackButtonPress={() => {
                    const backTo = params?.backTo ?? '';
                    let backToRoute = '';

                    if (backTo) {
                        backToRoute = appendParam(backTo, 'state', currentState ?? '');
                    }

                    // @ts-expect-error Navigation.goBack does take a param
                    Navigation.goBack(backToRoute);
                }}
            />

            <SelectionList
                onSelectRow={selectCountryState}
                headerMessage={headerMessage}
                // Label can be an empty string
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                textInputLabel={label || translate('common.state')}
                textInputValue={searchValue}
                sections={[{data: searchResults, indexOffset: 0}]}
                onChangeText={setSearchValue}
                initiallyFocusedOptionKey={currentState}
                shouldUseDynamicMaxToRenderPerBatch
            />
        </ScreenWrapper>
    );
}

StateSelectionPage.displayName = 'StateSelectionPage';

export default StateSelectionPage;
