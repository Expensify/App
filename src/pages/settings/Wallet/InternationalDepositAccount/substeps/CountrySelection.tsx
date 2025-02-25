import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import searchOptions from '@libs/searchOptions';
import type {Option} from '@libs/searchOptions';
import StringUtils from '@libs/StringUtils';
import type {CustomSubStepProps} from '@pages/settings/Wallet/InternationalDepositAccount/types';
import {fetchCorpayFields} from '@userActions/BankAccounts';
import Text from '@src/components/Text';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';

function CountrySelection({isEditing, onNext, formValues, resetScreenIndex}: CustomSubStepProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const [currentCountry, setCurrentCountry] = useState(formValues.bankCountry);

    const onCountrySelected = useCallback(() => {
        if (currentCountry === CONST.COUNTRY.US) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_US_BANK_ACCOUNT);
            return;
        }
        if (isEditing && formValues.bankCountry === currentCountry) {
            onNext();
            return;
        }
        fetchCorpayFields(currentCountry);
        resetScreenIndex?.(CONST.CORPAY_FIELDS.INDEXES.MAPPING.BANK_ACCOUNT_DETAILS);
    }, [currentCountry, formValues.bankCountry, isEditing, onNext, resetScreenIndex]);

    const onSelectionChange = useCallback((country: Option) => {
        setCurrentCountry(country.value);
    }, []);

    const countries = useMemo(
        () =>
            Object.keys(CONST.ALL_COUNTRIES)
                .filter((countryISO) => !CONST.CORPAY_FIELDS.EXCLUDED_COUNTRIES.includes(countryISO))
                .map((countryISO) => {
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

    const searchResults = searchOptions(debouncedSearchValue, countries);
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
                onConfirm={onCountrySelected}
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

CountrySelection.displayName = 'CountrySelection';

export default CountrySelection;
