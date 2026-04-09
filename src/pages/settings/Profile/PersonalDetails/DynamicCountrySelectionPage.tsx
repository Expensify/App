import React, {useCallback, useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useInitialSelection from '@hooks/useInitialSelection';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type {Option} from '@libs/searchOptions';
import searchOptions from '@libs/searchOptions';
import {moveInitialSelectionToTopByValue} from '@libs/SelectionListOrderUtils';
import StringUtils from '@libs/StringUtils';
import {appendParam} from '@libs/Url';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DynamicCountrySelectionPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.DYNAMIC_ADDRESS_COUNTRY>;

function DynamicCountrySelectionPage({route}: DynamicCountrySelectionPageProps) {
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const {translate} = useLocalize();
    const currentCountry = route.params.country;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.ADDRESS_COUNTRY.path);
    const initialSelectedValue = useInitialSelection(currentCountry ?? undefined, {resetOnFocus: true});
    const initialSelectedValues = initialSelectedValue ? [initialSelectedValue] : [];

    const countries = useMemo(
        () =>
            Object.keys(CONST.ALL_COUNTRIES).map((countryISO) => {
                const countryName = translate(`allCountries.${countryISO}` as TranslationPaths);
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

    const orderedCountries = moveInitialSelectionToTopByValue(countries, initialSelectedValues);
    const searchResults = searchOptions(debouncedSearchValue, debouncedSearchValue ? countries : orderedCountries);

    const selectCountry = useCallback(
        (option: Option) => {
            Navigation.goBack(appendParam(backPath, 'country', option.value), {compareParams: false});
        },
        [backPath],
    );

    const textInputOptions = useMemo(
        () => ({
            headerMessage: debouncedSearchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '',
            label: translate('common.country'),
            value: searchValue,
            onChangeText: setSearchValue,
        }),
        [debouncedSearchValue, searchResults.length, searchValue, translate, setSearchValue],
    );

    return (
        <ScreenWrapper
            testID="DynamicCountrySelectionPage"
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                title={translate('common.country')}
                shouldShowBackButton
                onBackButtonPress={() => {
                    Navigation.goBack(currentCountry ? appendParam(backPath, 'country', currentCountry) : backPath, {compareParams: false});
                }}
            />

            <SelectionList
                data={searchResults}
                ListItem={RadioListItem}
                onSelectRow={selectCountry}
                textInputOptions={textInputOptions}
                searchValueForFocusSync={debouncedSearchValue}
                initiallyFocusedItemKey={initialSelectedValue}
                shouldSingleExecuteRowSelect
                addBottomSafeAreaPadding
            />
        </ScreenWrapper>
    );
}

export default DynamicCountrySelectionPage;
