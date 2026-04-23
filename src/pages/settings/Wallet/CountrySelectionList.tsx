import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useLayoutEffect, useRef, useState} from 'react';
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

    /** Whether the wallet flow should reset the list viewport when the screen regains focus after the initial mount */
    shouldResetViewportOnFocusReturn?: boolean;

    /** Whether the user is editing an existing account */
    isEditing?: boolean;

    /** Custom content to display in the footer */
    footerContent?: React.ReactNode;
};

function CountrySelectionList({isEditing, selectedCountry, countries, onCountrySelected, onConfirm, shouldResetViewportOnFocusReturn = false, footerContent}: CountrySelectionListProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const selectionListRef = useRef<SelectionListHandle<Option> | null>(null);
    const hasFocusedOnceRef = useRef(false);
    const completedFocusReturnVersionRef = useRef(0);
    const [focusReturnVersion, setFocusReturnVersion] = useState(0);
    const initialSelectedValue = useInitialSelection(selectedCountry ?? undefined, {resetOnFocus: true});
    const initialSelectedValues = initialSelectedValue ? [initialSelectedValue] : [];

    useFocusEffect(
        useCallback(() => {
            if (!shouldResetViewportOnFocusReturn) {
                return;
            }

            if (!hasFocusedOnceRef.current) {
                hasFocusedOnceRef.current = true;
                return;
            }

            setFocusReturnVersion((currentVersion) => currentVersion + 1);
        }, [shouldResetViewportOnFocusReturn]),
    );

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
        if (
            !shouldResetViewportOnFocusReturn ||
            focusReturnVersion === 0 ||
            focusReturnVersion === completedFocusReturnVersionRef.current ||
            debouncedSearchValue ||
            !isSelectedCountryPinnedToTop
        ) {
            return;
        }

        selectionListRef.current?.scrollToIndex(0);
        completedFocusReturnVersionRef.current = focusReturnVersion;
    }, [debouncedSearchValue, focusReturnVersion, isSelectedCountryPinnedToTop, shouldResetViewportOnFocusReturn]);

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
