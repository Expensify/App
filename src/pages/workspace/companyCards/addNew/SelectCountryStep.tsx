import {useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import Text from '@components/Text';
import useCurrencyList from '@hooks/useCurrencyList';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {getPlaidCountry, isPlaidSupportedCountry} from '@libs/CardUtils';
import searchOptions from '@libs/searchOptions';
import type {Option} from '@libs/searchOptions';
import StringUtils from '@libs/StringUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import {clearAddNewCardFlow, setAddNewCompanyCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type CountryStepProps = {
    policyID?: string;
};

function SelectCountryStep({policyID}: CountryStepProps) {
    const {translate} = useLocalize();
    const route = useRoute<PlatformStackRouteProp<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_ADD_NEW>>();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const {currencyList} = useCurrencyList();
    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY, {canBeMissing: false});
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD, {canBeMissing: true});

    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    const getCountry = useCallback(() => {
        if (addNewCard?.data?.selectedCountry) {
            return addNewCard.data.selectedCountry;
        }

        return getPlaidCountry(policy?.outputCurrency, currencyList, countryByIp);
    }, [addNewCard?.data.selectedCountry, countryByIp, currencyList, policy?.outputCurrency]);

    const initialCountryRef = useRef<string | undefined>(getCountry());
    const [currentCountry, setCurrentCountry] = useState<string | undefined>(initialCountryRef.current);
    const [hasError, setHasError] = useState(false);
    const doesCountrySupportPlaid = isPlaidSupportedCountry(currentCountry);

    const submit = useCallback(() => {
        if (!currentCountry) {
            setHasError(true);
        } else {
            if (addNewCard?.data.selectedCountry !== currentCountry) {
                clearAddNewCardFlow();
            }
            setAddNewCompanyCardStepAndData({
                step: doesCountrySupportPlaid ? CONST.COMPANY_CARDS.STEP.SELECT_FEED_TYPE : CONST.COMPANY_CARDS.STEP.CARD_TYPE,
                data: {
                    selectedCountry: currentCountry,
                    selectedFeedType: doesCountrySupportPlaid ? CONST.COMPANY_CARDS.FEED_TYPE.DIRECT : CONST.COMPANY_CARDS.FEED_TYPE.CUSTOM,
                },
                isEditing: false,
            });
        }
    }, [addNewCard?.data.selectedCountry, currentCountry, doesCountrySupportPlaid]);

    useEffect(() => {
        setCurrentCountry(getCountry());
        // Keep the initial ref stable so we only reorder once when the list opens
        if (!initialCountryRef.current) {
            initialCountryRef.current = getCountry();
        }
    }, [getCountry]);

    const handleBackButtonPress = () => {
        if (route?.params?.backTo) {
            Navigation.navigate(route.params.backTo);
            return;
        }
        Navigation.goBack();
    };

    const onSelectionChange = useCallback((country: Option) => {
        setCurrentCountry(country.value);
    }, []);

    const initialCountry = initialCountryRef.current;

    const allCountries = useMemo(() => {
        const excludedCountriesSet = new Set(CONST.PLAID_EXCLUDED_COUNTRIES);
        const countryKeys = Object.keys(CONST.ALL_COUNTRIES).filter((countryISO) => !excludedCountriesSet.has(countryISO));

        if (!initialCountry || countryKeys.length <= CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD) {
            return countryKeys;
        }

        const selectedOptions: string[] = [];
        const unselectedOptions: string[] = [];

        for (const countryISO of countryKeys) {
            if (countryISO === initialCountry) {
                selectedOptions.push(countryISO);
            } else {
                unselectedOptions.push(countryISO);
            }
        }

        return [...selectedOptions, ...unselectedOptions];
    }, [initialCountry]);

    const countries = useMemo(
        () =>
            allCountries.map((countryISO) => {
                const countryName = translate(`allCountries.${countryISO}` as TranslationPaths);
                return {
                    value: countryISO,
                    keyForList: countryISO,
                    text: countryName,
                    isSelected: currentCountry === countryISO,
                    searchValue: StringUtils.sanitizeString(`${countryISO}${countryName}`),
                };
            }),
        [translate, currentCountry, allCountries],
    );

    const searchResults = useMemo(() => {
        return searchOptions(debouncedSearchValue, countries);
    }, [countries, debouncedSearchValue]);
    const headerMessage = debouncedSearchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '';

    const textInputOptions = useMemo(
        () => ({
            headerMessage,
            value: searchValue,
            label: translate('common.search'),
            onChangeText: setSearchValue,
        }),
        [headerMessage, searchValue, setSearchValue, translate],
    );

    const confirmButtonOptions = useMemo(
        () => ({
            onConfirm: submit,
            showButton: true,
            text: translate('common.next'),
        }),
        [submit, translate],
    );

    return (
        <ScreenWrapper
            testID="SelectCountryStep"
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.addCards')}
                onBackButtonPress={handleBackButtonPress}
            />

            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.addNewCard.whereIsYourBankLocated')}</Text>
            <SelectionList
                data={searchResults}
                ListItem={RadioListItem}
                onSelectRow={onSelectionChange}
                textInputOptions={textInputOptions}
                confirmButtonOptions={confirmButtonOptions}
                disableMaintainingScrollPosition
                shouldSingleExecuteRowSelect
                addBottomSafeAreaPadding
                shouldStopPropagation
            >
                {hasError && (
                    <View style={[styles.ph3, styles.mb3]}>
                        <FormHelpMessage
                            isError={hasError}
                            message={translate('workspace.companyCards.addNewCard.error.pleaseSelectCountry')}
                        />
                    </View>
                )}
            </SelectionList>
        </ScreenWrapper>
    );
}

export default SelectCountryStep;
