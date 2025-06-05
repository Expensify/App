import {useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
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
    const [currencyList = {}] = useOnyx(ONYXKEYS.CURRENCY_LIST, {canBeMissing: true});
    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY, {canBeMissing: false});
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD, {canBeMissing: true});

    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    const getCountry = useCallback(() => {
        if (addNewCard?.data?.selectedCountry) {
            return addNewCard.data.selectedCountry;
        }
        const selectedCurrency = policy?.outputCurrency ? currencyList?.[policy.outputCurrency] : null;
        const countries = selectedCurrency?.countries;

        if (policy?.outputCurrency === CONST.CURRENCY.EUR && countryByIp && countries?.includes(countryByIp)) {
            return countryByIp;
        }
        const country = countries?.[0];
        return country ?? '';
    }, [addNewCard?.data.selectedCountry, countryByIp, currencyList, policy?.outputCurrency]);
    const [currentCountry, setCurrentCountry] = useState<string | undefined>(getCountry);
    const [hasError, setHasError] = useState(false);

    const submit = () => {
        if (!currentCountry) {
            setHasError(true);
        } else {
            if (addNewCard?.data.selectedCountry !== currentCountry) {
                clearAddNewCardFlow();
            }
            setAddNewCompanyCardStepAndData({
                step: CONST.COMPANY_CARDS.STEP.SELECT_FEED_TYPE,
                data: {
                    selectedCountry: currentCountry,
                },
                isEditing: false,
            });
        }
    };

    useEffect(() => {
        setCurrentCountry(getCountry());
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

    const countries = useMemo(
        () =>
            Object.keys(CONST.ALL_COUNTRIES)
                .filter((countryISO) => !CONST.PLAID_EXCLUDED_COUNTRIES.includes(countryISO))
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
        <ScreenWrapper
            testID={SelectCountryStep.displayName}
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
                headerMessage={headerMessage}
                sections={[{data: searchResults}]}
                textInputValue={searchValue}
                textInputLabel={translate('common.search')}
                onChangeText={setSearchValue}
                onSelectRow={onSelectionChange}
                onConfirm={submit}
                ListItem={RadioListItem}
                initiallyFocusedOptionKey={currentCountry}
                shouldSingleExecuteRowSelect
                shouldStopPropagation
                shouldUseDynamicMaxToRenderPerBatch
                showConfirmButton
                addBottomSafeAreaPadding
                confirmButtonText={translate('common.next')}
                shouldUpdateFocusedIndex
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

SelectCountryStep.displayName = 'SelectCountryStep';

export default SelectCountryStep;
