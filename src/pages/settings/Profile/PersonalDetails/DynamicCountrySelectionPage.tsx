import React, {useCallback, useMemo, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useInitialSelectionRef from '@hooks/useInitialSelectionRef';
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
    const [searchValue, setSearchValue] = useState('');
    const {translate} = useLocalize();
    const currentCountry = route.params.country;
    const initialSelectedValues = useInitialSelectionRef(currentCountry ? [currentCountry] : [], {resetOnFocus: true});
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.ADDRESS_COUNTRY.path);

    const countryKeys = useMemo(() => Object.keys(CONST.ALL_COUNTRIES), []);

    const baseCountries = useMemo(
        () =>
            countryKeys.map((countryISO) => {
                const countryName = translate(`allCountries.${countryISO}` as TranslationPaths);
                return {
                    value: countryISO,
                    keyForList: countryISO,
                    text: countryName,
                    isSelected: currentCountry === countryISO,
                    searchValue: StringUtils.sanitizeString(`${countryISO}${countryName}`),
                };
            }),
        [translate, countryKeys, currentCountry],
    );

    const orderedCountries = useMemo(() => {
        const shouldReorderInitialSelection = initialSelectedValues.length > 0 && baseCountries.length > CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD;

        if (!shouldReorderInitialSelection) {
            return baseCountries;
        }

        return moveInitialSelectionToTopByValue(baseCountries, initialSelectedValues);
    }, [baseCountries, initialSelectedValues]);

    const searchResults = useMemo(() => searchOptions(searchValue, searchValue ? baseCountries : orderedCountries), [baseCountries, orderedCountries, searchValue]);

    const selectCountry = useCallback(
        (option: Option) => {
            Navigation.goBack(appendParam(backPath, 'country', option.value), {compareParams: false});
        },
        [backPath],
    );

    const textInputOptions = useMemo(
        () => ({
            headerMessage: searchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '',
            label: translate('common.country'),
            value: searchValue,
            onChangeText: setSearchValue,
        }),
        [searchResults.length, searchValue, translate],
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
                initiallyFocusedItemKey={currentCountry}
                shouldSingleExecuteRowSelect
                addBottomSafeAreaPadding
            />
        </ScreenWrapper>
    );
}

export default DynamicCountrySelectionPage;
