import {isUserValidatedSelector} from '@selectors/Account';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import searchOptions from '@libs/searchOptions';
import type {Option} from '@libs/searchOptions';
import StringUtils from '@libs/StringUtils';
import type CustomSubStepProps from '@pages/settings/Wallet/InternationalDepositAccount/types';
import {fetchCorpayFields} from '@userActions/BankAccounts';
import Text from '@src/components/Text';
import CONST, {COUNTRIES_US_BANK_FLOW} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function CountrySelection({isEditing, onNext, formValues, resetScreenIndex, fieldsMap}: CustomSubStepProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const [searchValue, setSearchValue] = useState('');
    const [currentCountry, setCurrentCountry] = useState(formValues.bankCountry);
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector, canBeMissing: false});

    const onCountrySelected = useCallback(() => {
        if (COUNTRIES_US_BANK_FLOW.includes(currentCountry)) {
            if (isUserValidated) {
                Navigation.navigate(ROUTES.SETTINGS_ADD_US_BANK_ACCOUNT_ENTRY_POINT);
            } else {
                Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT_SELECT_COUNTRY_VERIFY_ACCOUNT);
            }
            return;
        }
        if (!isEmptyObject(fieldsMap) && formValues.bankCountry === currentCountry) {
            onNext();
            return;
        }
        fetchCorpayFields(currentCountry);
        resetScreenIndex?.(CONST.CORPAY_FIELDS.INDEXES.MAPPING.BANK_ACCOUNT_DETAILS);
    }, [currentCountry, fieldsMap, formValues.bankCountry, resetScreenIndex, isUserValidated, onNext]);

    const onSelectionChange = useCallback((country: Option) => {
        setCurrentCountry(country.value);
    }, []);

    const initialCountry = formValues.bankCountry;

    const orderedCountryISOs = useMemo(() => {
        const excludedCountriesSet = new Set(CONST.CORPAY_FIELDS.EXCLUDED_COUNTRIES);
        const countryKeys = Object.keys(CONST.ALL_COUNTRIES).filter((countryISO) => !excludedCountriesSet.has(countryISO));

        if (!initialCountry || countryKeys.length <= CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD) {
            return countryKeys;
        }

        const selected: string[] = [];
        const unselected: string[] = [];

        for (const countryISO of countryKeys) {
            if (countryISO === initialCountry) {
                selected.push(countryISO);
            } else {
                unselected.push(countryISO);
            }
        }

        return [...selected, ...unselected];
    }, [initialCountry]);

    const countries = useMemo(
        () =>
            orderedCountryISOs.map((countryISO) => {
                const countryName = translate(`allCountries.${countryISO}` as TranslationPaths);
                return {
                    value: countryISO,
                    keyForList: countryISO,
                    text: countryName,
                    isSelected: currentCountry === countryISO,
                    searchValue: StringUtils.sanitizeString(`${countryISO}${countryName}`),
                };
            }),
        [translate, currentCountry, orderedCountryISOs],
    );

    const searchResults = useMemo(() => searchOptions(searchValue, countries), [countries, searchValue]);

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
            onConfirm: onCountrySelected,
        }),
        [isEditing, isOffline, onCountrySelected, translate],
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

export default CountrySelection;
