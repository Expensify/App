import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import searchOptions from '@libs/searchOptions';
import type {Option} from '@libs/searchOptions';
import StringUtils from '@libs/StringUtils';
import Text from '@src/components/Text';
import type {TranslationPaths} from '@src/languages/types';

type CountrySelectionListProps = {
    /** Whether the user is editing an existing account */
    isEditing: boolean;

    /** The currently selected country */
    selectedCountry: string;

    /** List of available countries */
    countries: string[];

    /** Function to call on step confirmation */
    onCountrySelected: (country: string) => void;
};

function CountrySelectionList({isEditing, selectedCountry, countries, onCountrySelected}: CountrySelectionListProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const [currentCountry, setCurrentCountry] = useState(selectedCountry);

    const onSelectionChange = useCallback((country: Option) => {
        setCurrentCountry(country.value);
    }, []);

    const countriesList = useMemo(() => {
        return countries.map((countryISO) => {
            const countryName = translate(`allCountries.${countryISO}` as TranslationPaths);
            return {
                value: countryISO,
                keyForList: countryISO,
                text: countryName,
                isSelected: currentCountry === countryISO,
                searchValue: StringUtils.sanitizeString(`${countryISO}${countryName}`),
            };
        });
    }, [translate, currentCountry, countries]);

    const searchResults = searchOptions(debouncedSearchValue, countriesList);
    const headerMessage = debouncedSearchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '';

    return (
        <FullPageOfflineBlockingView>
            <View style={styles.ph5}>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('addPersonalBankAccount.countrySelectionStepHeader')}</Text>
            </View>
            <SelectionList
                headerMessage={headerMessage}
                sections={[{data: searchResults}]}
                textInputValue={searchValue}
                textInputLabel={translate('common.search')}
                onChangeText={setSearchValue}
                onSelectRow={onSelectionChange}
                onConfirm={() => onCountrySelected(currentCountry)}
                ListItem={RadioListItem}
                initiallyFocusedOptionKey={currentCountry}
                shouldSingleExecuteRowSelect
                shouldStopPropagation
                shouldUseDynamicMaxToRenderPerBatch
                showConfirmButton
                confirmButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
                isConfirmButtonDisabled={isOffline}
                shouldUpdateFocusedIndex
            />
        </FullPageOfflineBlockingView>
    );
}

CountrySelectionList.displayName = 'CountrySelector';

export default CountrySelectionList;
