import {useNavigation, useRoute} from '@react-navigation/native';
import {CONST as COMMON_CONST} from 'expensify-common';
import isEmpty from 'lodash/isEmpty';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import searchCountryOptions from '@libs/searchCountryOptions';
import type {CountryData} from '@libs/searchCountryOptions';
import StringUtils from '@libs/StringUtils';
import {appendParam} from '@libs/Url';
import type {Route} from '@src/ROUTES';

type State = keyof typeof COMMON_CONST.STATES;

type RouteParams = {
    state?: string;
    label?: string;
    backTo?: string;
};

function StateSelectionPage() {
    const route = useRoute();
    const navigation = useNavigation();
    const {translate} = useLocalize();

    const [searchValue, setSearchValue] = useState('');
    const params = route.params as RouteParams | undefined;
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

            // Determine navigation action based on "backTo" presence and route stack length.
            if (navigation.getState()?.routes.length === 1) {
                // If this is the only page in the navigation stack (examples include direct navigation to this page via URL or page reload).
                if (isEmpty(backTo)) {
                    // No "backTo": default back navigation.
                    Navigation.goBack();
                } else {
                    // "backTo" provided: navigate back to "backTo" with state parameter.
                    Navigation.goBack(appendParam(backTo, 'state', option.value));
                }
            } else if (!isEmpty(backTo)) {
                // Most common case: Navigation stack has multiple routes and "backTo" is defined: navigate to "backTo" with state parameter.
                Navigation.navigate(appendParam(backTo, 'state', option.value));
            } else {
                // This is a fallback block and should never execute if StateSelector is correctly appending the "backTo" route.
                // Navigation stack has multiple routes but no "backTo" defined: default back navigation.
                Navigation.goBack();
            }
        },
        [navigation, params?.backTo],
    );

    return (
        <ScreenWrapper
            testID={StateSelectionPage.displayName}
            includeSafeAreaPaddingBottom={false}
        >
            <HeaderWithBackButton
                // Label can be an empty string
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                title={label || translate('common.state')}
                shouldShowBackButton
                onBackButtonPress={() => {
                    const backTo = params?.backTo ?? '';
                    let backToRoute: Route | undefined;

                    if (backTo) {
                        backToRoute = appendParam(backTo, 'state', currentState ?? '');
                    }

                    Navigation.goBack(backToRoute);
                }}
            />
            {/* This empty, non-harmful view fixes the issue with SelectionList scrolling and shouldUseDynamicMaxToRenderPerBatch. It can be removed without consequences if a solution for SelectionList is found. See comment https://github.com/Expensify/App/pull/36770#issuecomment-2017028096 */}
            <View />

            <SelectionList
                onSelectRow={selectCountryState}
                shouldSingleExecuteRowSelect
                headerMessage={headerMessage}
                // Label can be an empty string
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                textInputLabel={label || translate('common.state')}
                textInputValue={searchValue}
                sections={[{data: searchResults}]}
                onChangeText={setSearchValue}
                initiallyFocusedOptionKey={currentState}
                shouldUseDynamicMaxToRenderPerBatch
                ListItem={RadioListItem}
            />
        </ScreenWrapper>
    );
}

StateSelectionPage.displayName = 'StateSelectionPage';

export default StateSelectionPage;
