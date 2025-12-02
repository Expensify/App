import React, {useCallback, useMemo, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import RadioListItem from '@components/SelectionListWithSections/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type {Option} from '@libs/searchOptions';
import searchOptions from '@libs/searchOptions';
import StringUtils from '@libs/StringUtils';
import {appendParam} from '@libs/Url';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {Route} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type CountrySelectionPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.ADDRESS_COUNTRY>;

function CountrySelectionPage({route}: CountrySelectionPageProps) {
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

    const searchResults = searchOptions(searchValue, countries);
    const headerMessage = searchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '';

    const selectCountry = useCallback(
        (option: Option) => {
            const backTo = route.params.backTo ?? '';

            // Check the "backTo" parameter to decide navigation behavior
            if (!backTo) {
                Navigation.goBack();
            } else {
                // Set compareParams to false because we want to go back to this particular screen and update params (country).
                Navigation.goBack(appendParam(backTo, 'country', option.value), {compareParams: false});
            }
        },
        [route.params.backTo],
    );

    return (
        <ScreenWrapper
            testID={CountrySelectionPage.displayName}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                title={translate('common.country')}
                shouldShowBackButton
                onBackButtonPress={() => {
                    const backTo = route.params.backTo ?? '';
                    const backToRoute = backTo ? `${backTo}?country=${currentCountry}` : '';
                    Navigation.goBack(backToRoute as Route, {compareParams: false});
                }}
            />

            <SelectionList
                headerMessage={headerMessage}
                textInputLabel={translate('common.country')}
                textInputValue={searchValue}
                sections={[{data: searchResults}]}
                ListItem={RadioListItem}
                onSelectRow={selectCountry}
                shouldSingleExecuteRowSelect
                onChangeText={setSearchValue}
                initiallyFocusedOptionKey={currentCountry}
                shouldUseDynamicMaxToRenderPerBatch
                addBottomSafeAreaPadding
            />
        </ScreenWrapper>
    );
}

CountrySelectionPage.displayName = 'CountrySelectionPage';

export default CountrySelectionPage;
