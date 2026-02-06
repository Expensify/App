import React, {useState} from 'react';
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

    /** Function to call when the user confirms their selection */
    onConfirm: () => void;

    /** Whether the user is editing an existing account */
    isEditing?: boolean;

    /** Custom content to display in the footer */
    footerContent?: React.ReactNode;
};

function CountrySelectionList({isEditing, selectedCountry, countries, onCountrySelected, onConfirm, footerContent}: CountrySelectionListProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const [searchValue, setSearchValue] = useState('');

    const onSelectionChange = (country: Option) => {
        onCountrySelected(country.value);
    };

    const countriesList = countries.map((countryISO) => {
        const countryName = translate(`allCountries.${countryISO}` as TranslationPaths);
        return {
            value: countryISO,
            keyForList: countryISO,
            text: countryName,
            isSelected: selectedCountry === countryISO,
            searchValue: StringUtils.sanitizeString(`${countryISO}${countryName}`),
        };
    });

    const searchResults = searchOptions(searchValue, countriesList);

    const textInputOptions = {
        label: translate('common.search'),
        value: searchValue,
        onChangeText: setSearchValue,
        headerMessage: searchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '',
    };

    const confirmButtonOptions = {
        showButton: true,
        text: isEditing ? translate('common.confirm') : translate('common.next'),
        isDisabled: isOffline,
        onConfirm,
    };

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
                initiallyFocusedItemKey={selectedCountry}
                footerContent={footerContent}
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
