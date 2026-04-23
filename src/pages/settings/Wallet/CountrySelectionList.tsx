import React, {useLayoutEffect, useRef} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {SelectionListHandle} from '@components/SelectionList/types';
import useDebouncedState from '@hooks/useDebouncedState';
import useInitialSelection from '@hooks/useInitialSelection';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import searchOptions from '@libs/searchOptions';
import type {Option} from '@libs/searchOptions';
import {moveInitialSelectionToTopByValue} from '@libs/SelectionListOrderUtils';
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

    /** Incremented when the wallet country screen returns from the next step and needs to restore its viewport */
    restoreViewportVersion?: number;

    /** Whether the user is editing an existing account */
    isEditing?: boolean;

    /** Custom content to display in the footer */
    footerContent?: React.ReactNode;
};

function CountrySelectionList({isEditing, selectedCountry, countries, onCountrySelected, onConfirm, restoreViewportVersion, footerContent}: CountrySelectionListProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const selectionListRef = useRef<SelectionListHandle<Option> | null>(null);
    const completedRestoreViewportVersionRef = useRef<number | undefined>(undefined);
    const initialSelectedValue = useInitialSelection(selectedCountry ?? undefined, {resetDeps: [restoreViewportVersion], resetOnFocus: restoreViewportVersion === undefined});
    const initialSelectedValues = initialSelectedValue ? [initialSelectedValue] : [];

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

    const orderedCountries = moveInitialSelectionToTopByValue(countriesList, initialSelectedValues);
    const searchResults = searchOptions(debouncedSearchValue, debouncedSearchValue ? countriesList : orderedCountries);
    const isSelectedCountryPinnedToTop = !!selectedCountry && orderedCountries.at(0)?.value === selectedCountry;

    useLayoutEffect(() => {
        if (restoreViewportVersion === undefined || restoreViewportVersion === completedRestoreViewportVersionRef.current || debouncedSearchValue || !isSelectedCountryPinnedToTop) {
            return;
        }

        selectionListRef.current?.scrollToIndex(0);
        completedRestoreViewportVersionRef.current = restoreViewportVersion;
    }, [debouncedSearchValue, isSelectedCountryPinnedToTop, restoreViewportVersion]);

    const textInputOptions = {
        label: translate('common.search'),
        value: searchValue,
        onChangeText: setSearchValue,
        headerMessage: debouncedSearchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '',
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
                ref={selectionListRef}
                data={searchResults}
                ListItem={RadioListItem}
                onSelectRow={onSelectionChange}
                textInputOptions={textInputOptions}
                searchValueForFocusSync={debouncedSearchValue}
                confirmButtonOptions={confirmButtonOptions}
                initiallyFocusedItemKey={initialSelectedValue}
                footerContent={footerContent}
                disableMaintainingScrollPosition
                shouldUpdateFocusedIndex
                shouldSingleExecuteRowSelect
                shouldScrollToFocusedIndex={false}
                shouldScrollToFocusedIndexOnMount={false}
                shouldStopPropagation
            />
        </FullPageOfflineBlockingView>
    );
}

CountrySelectionList.displayName = 'CountrySelectionList';

export default CountrySelectionList;
