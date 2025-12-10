import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import searchOptions from '@libs/searchOptions';
import type {Option} from '@libs/searchOptions';
import StringUtils from '@libs/StringUtils';
import Text from '@src/components/Text';
import type {TranslationPaths} from '@src/languages/types';

type CountrySelectionListProps = {
    /** The currently selected country */
    selectedCountry: string;

    /** List of available countries in country code format */
    countries: string[];

    /** Function to call on step confirmation */
    onCountrySelected: (country: string) => void;

    /** Whether the user is editing an existing account */
    isEditing?: boolean;
};

function CountrySelectionList({isEditing, selectedCountry, countries, onCountrySelected}: CountrySelectionListProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const [searchValue, setSearchValue] = useState('');
    const [currentCountry, setCurrentCountry] = useState(selectedCountry);

    const onSelectionChange = useCallback((country: Option) => {
        setCurrentCountry(country.value);
    }, []);

    const countriesList = useMemo(
        () =>
            countries.map((countryISO) => {
                const countryName = translate(`allCountries.${countryISO}` as TranslationPaths);
                return {
                    value: countryISO,
                    keyForList: countryISO,
                    text: countryName,
                    isSelected: currentCountry === countryISO,
                    searchValue: StringUtils.sanitizeString(`${countryISO}${countryName}`),
                };
            }),
        [translate, currentCountry, countries],
    );

    const searchResults = searchOptions(searchValue, countriesList);

    const textInputOptions = useMemo(
        () => ({
            label: translate('common.search'),
            value: searchValue,
            onChangeText: setSearchValue,
            headerMessage: searchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '',
        }),
        [translate, searchValue, setSearchValue, searchResults.length],
    );

    const confirmButtonOptions = useMemo(
        () => ({
            showButton: true,
            text: isEditing ? translate('common.confirm') : translate('common.next'),
            isDisabled: isOffline,
            onConfirm: () => onCountrySelected(currentCountry),
        }),
        [isEditing, isOffline, onCountrySelected, translate, currentCountry],
    );

    return (
        <FullPageOfflineBlockingView>
            <View style={styles.ph5}>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('addPersonalBankAccount.countrySelectionStepHeader')}</Text>
            </View>
            <SelectionList
                data={searchResults}
                ListItem={RadioListItem}
                onSelectRow={onSelectionChange}
                textInputOptions={textInputOptions}
                confirmButtonOptions={confirmButtonOptions}
                initiallyFocusedItemKey={currentCountry}
                disableMaintainingScrollPosition
                shouldSingleExecuteRowSelect
                shouldUpdateFocusedIndex
                shouldStopPropagation
            />
        </FullPageOfflineBlockingView>
    );
}

CountrySelectionList.displayName = 'CountrySelector';

export default CountrySelectionList;
