/**
 * Dynamic route version of the state selection page. Reads the current state/label from the
 * dynamic route params and returns the chosen state to the previous screen via the dynamic back path.
 */
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';

import useDebouncedState from '@hooks/useDebouncedState';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useInitialSelection from '@hooks/useInitialSelection';
import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type {Option} from '@libs/searchOptions';
import searchOptions from '@libs/searchOptions';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import StringUtils from '@libs/StringUtils';
import {appendParam} from '@libs/Url';

import type {TranslationPaths} from '@src/languages/types';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {CONST as COMMON_CONST} from 'expensify-common';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';

type DynamicStateSelectionPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.DYNAMIC_ADDRESS_STATE>;

function DynamicStateSelectionPage({route}: DynamicStateSelectionPageProps) {
    const {translate} = useLocalize();

    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const currentState = route.params?.state;
    const label = route.params?.label;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.ADDRESS_STATE.path);
    const initialSelectedValue = useInitialSelection(currentState ?? undefined, {resetOnFocus: true});
    const initialSelectedValues = initialSelectedValue ? [initialSelectedValue] : [];

    const countryStates = useMemo(
        () =>
            Object.keys(COMMON_CONST.STATES).map((state) => {
                const stateName = translate(`allStates.${state}.stateName` as TranslationPaths);
                const stateISO = translate(`allStates.${state}.stateISO` as TranslationPaths);
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

    const orderedCountryStates = moveInitialSelectionToTop(countryStates, initialSelectedValues);
    const searchResults = searchOptions(debouncedSearchValue, debouncedSearchValue ? countryStates : orderedCountryStates);
    const headerMessage = debouncedSearchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '';

    const selectCountryState = useCallback(
        (option: Option) => {
            Navigation.goBack(appendParam(backPath, 'state', option.value), {compareParams: false});
        },
        [backPath],
    );

    const textInputOptions = useMemo(
        () => ({
            headerMessage,
            // Label can be an empty string
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            label: label || translate('common.state'),
            value: searchValue,
            onChangeText: setSearchValue,
        }),
        [headerMessage, label, searchValue, setSearchValue, translate],
    );

    return (
        <ScreenWrapper
            testID="DynamicStateSelectionPage"
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                // Label can be an empty string
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                title={label || translate('common.state')}
                shouldShowBackButton
                onBackButtonPress={() => {
                    Navigation.goBack(backPath, {compareParams: false});
                }}
            />
            {/* This empty, non-harmful view fixes the issue with SelectionList scrolling and shouldUseDynamicMaxToRenderPerBatch. It can be removed without consequences if a solution for SelectionList is found. See comment https://github.com/Expensify/App/pull/36770#issuecomment-2017028096 */}
            <View />
            <SelectionList
                data={searchResults}
                ListItem={SingleSelectListItem}
                onSelectRow={selectCountryState}
                textInputOptions={textInputOptions}
                searchValueForFocusSync={debouncedSearchValue}
                initiallyFocusedItemKey={initialSelectedValue}
                shouldSingleExecuteRowSelect
                disableMaintainingScrollPosition
                addBottomSafeAreaPadding
            />
        </ScreenWrapper>
    );
}

export default DynamicStateSelectionPage;
