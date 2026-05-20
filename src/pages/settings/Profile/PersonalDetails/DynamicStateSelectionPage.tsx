import {CONST as COMMON_CONST} from 'expensify-common';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
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
import type {MoneyRequestNavigatorParamList, SettingsNavigatorParamList} from '@libs/Navigation/types';
import type {Option} from '@libs/searchOptions';
import searchOptions from '@libs/searchOptions';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import StringUtils from '@libs/StringUtils';
import {appendParam} from '@libs/Url';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type State = keyof typeof COMMON_CONST.STATES;

type DynamicStateSelectionPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList | MoneyRequestNavigatorParamList,
    typeof SCREENS.SETTINGS.PROFILE.DYNAMIC_ADDRESS_STATE | typeof SCREENS.IOU_SEND.DYNAMIC_ADDRESS_STATE
>;

function DynamicStateSelectionPage({route}: DynamicStateSelectionPageProps) {
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const {translate} = useLocalize();
    const {state: currentState, label} = route.params ?? {};
    const dynamicStateRoute = route.name === SCREENS.IOU_SEND.DYNAMIC_ADDRESS_STATE ? DYNAMIC_ROUTES.IOU_SEND_ADDRESS_STATE : DYNAMIC_ROUTES.ADDRESS_STATE;
    const backPath = useDynamicBackPath(dynamicStateRoute.path);
    const initialSelectedValue = useInitialSelection(currentState ?? undefined, {resetOnFocus: true});
    const initialSelectedValues = initialSelectedValue ? [initialSelectedValue] : [];

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
                    Navigation.goBack(currentState ? appendParam(backPath, 'state', currentState) : backPath, {compareParams: false});
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
