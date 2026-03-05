import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import {useIsFocused} from '@react-navigation/native';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type {Option} from '@libs/searchOptions';
import searchOptions from '@libs/searchOptions';
import StringUtils from '@libs/StringUtils';
import {appendParam} from '@libs/Url';
import {moveInitialSelectionToTopByValue} from '@libs/SelectionListOrderUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {Route} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type CountrySelectionPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.ADDRESS_COUNTRY>;

function CountrySelectionPage({route}: CountrySelectionPageProps) {
    const [searchValue, setSearchValue] = useState('');
    const {translate} = useLocalize();
    const isFocused = useIsFocused();
    const currentCountry = route.params.country;
    const initialSelectedValuesRef = useRef<string[]>([]);
    const prevIsFocusedRef = useRef(false);
    const [selectionSnapshotVersion, setSelectionSnapshotVersion] = useState(0);

    useEffect(() => {
        const wasFocused = prevIsFocusedRef.current;
        if (isFocused && !wasFocused) {
            initialSelectedValuesRef.current = currentCountry ? [currentCountry] : [];
            setSelectionSnapshotVersion((version) => version + 1);
        }
        prevIsFocusedRef.current = isFocused;
    }, [currentCountry, isFocused]);

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
        const shouldReorderInitialSelection =
            !searchValue && initialSelectedValuesRef.current.length > 0 && baseCountries.length > CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD;

        if (!shouldReorderInitialSelection) {
            return baseCountries;
        }

        return moveInitialSelectionToTopByValue(baseCountries, initialSelectedValuesRef.current);
    }, [baseCountries, searchValue, selectionSnapshotVersion]);

    const searchResults = useMemo(() => searchOptions(searchValue, orderedCountries), [orderedCountries, searchValue]);

    const selectCountry = useCallback(
        (option: Option) => {
            const backTo = route.params.backTo ?? '';

            // Check the "backTo" parameter to decide navigation behavior
            if (!backTo) {
                Navigation.goBack();
            } else {
                // Set compareParams to false because we want to go back to this particular screen and update params (country).
                Navigation.goBack(appendParam(backTo, 'country', option.value), {compareParams: false});
            }
        },
        [route.params.backTo],
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
            testID="CountrySelectionPage"
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                title={translate('common.country')}
                shouldShowBackButton
                onBackButtonPress={() => {
                    const backTo = route.params.backTo ?? '';
                    const backToRoute = backTo ? `${backTo}?country=${currentCountry}` : '';
                    Navigation.goBack(backToRoute as Route, {compareParams: false});
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

export default CountrySelectionPage;
