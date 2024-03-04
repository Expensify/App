import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type {CountryData} from '@libs/searchCountryOptions';
import searchCountryOptions from '@libs/searchCountryOptions';
import StringUtils from '@libs/StringUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {Route} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type CountrySelectionPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.ADDRESS_COUNTRY>;

function CountrySelectionPage({route, navigation}: CountrySelectionPageProps) {
    const [searchValue, setSearchValue] = useState('');
    const {translate} = useLocalize();
    const currentCountry = route.params.country;

    const countries = useMemo(
        () =>
            Object.keys(CONST.ALL_COUNTRIES).map((countryISO) => {
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

    const searchResults = searchCountryOptions(searchValue, countries);
    const headerMessage = searchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '';

    const selectCountry = useCallback(
        (option: CountryData) => {
            const backTo = route.params.backTo ?? '';
            // Check the navigation state and "backTo" parameter to decide navigation behavior
            if (navigation.getState().routes.length === 1 && !backTo) {
                // If there is only one route and "backTo" is empty, go back in navigation
                Navigation.goBack();
            } else if (!!backTo && navigation.getState().routes.length === 1) {
                // If "backTo" is not empty and there is only one route, go back to the specific route defined in "backTo" with a country parameter
                Navigation.goBack(`${route.params.backTo}?country=${option.value}` as Route);
            } else {
                // Otherwise, navigate to the specific route defined in "backTo" with a country parameter
                Navigation.navigate(`${route.params.backTo}?country=${option.value}` as Route);
            }
        },
        [route, navigation],
    );

    return (
        <ScreenWrapper
            testID={CountrySelectionPage.displayName}
            includeSafeAreaPaddingBottom={false}
        >
            <HeaderWithBackButton
                title={translate('common.country')}
                shouldShowBackButton
                onBackButtonPress={() => {
                    const backTo = route.params.backTo ?? '';
                    const backToRoute = backTo ? (`${backTo}?country=${currentCountry}` as const) : '';
                    Navigation.goBack(backToRoute as Route);
                }}
            />

            <SelectionList
                headerMessage={headerMessage}
                textInputLabel={translate('common.country')}
                textInputValue={searchValue}
                sections={[{data: searchResults, indexOffset: 0}]}
                ListItem={RadioListItem}
                onSelectRow={selectCountry}
                onChangeText={setSearchValue}
                initiallyFocusedOptionKey={currentCountry}
                shouldUseDynamicMaxToRenderPerBatch
            />
        </ScreenWrapper>
    );
}

CountrySelectionPage.displayName = 'CountrySelectionPage';

export default CountrySelectionPage;
