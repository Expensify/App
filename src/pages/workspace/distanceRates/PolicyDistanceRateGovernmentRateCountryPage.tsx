import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';

import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';
import type {Option} from '@libs/searchOptions';
import searchOptions from '@libs/searchOptions';
import StringUtils from '@libs/StringUtils';

import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {setWorkspaceDistanceAutoUpdate} from '@userActions/Policy/DistanceRate';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useMemo} from 'react';
import {View} from 'react-native';

type PolicyDistanceRateGovernmentRateCountryPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATES_GOVERNMENT_RATE_COUNTRY>;

function PolicyDistanceRateGovernmentRateCountryPage({route}: PolicyDistanceRateGovernmentRateCountryPageProps) {
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [governmentMileageRates] = useOnyx(ONYXKEYS.GOVERNMENT_MILEAGE_RATES);
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    const customUnit = getDistanceRateCustomUnit(policy);
    const currentCountry = policy?.autoUpdateGovernmentRateCountry;

    const countries = useMemo(
        () =>
            CONST.CUSTOM_UNITS.GOVERNMENT_RATE_SUPPORTED_EUR_COUNTRIES.map((countryCode) => {
                const countryName = translate(`allCountries.${countryCode}` as TranslationPaths);
                return {
                    value: countryCode,
                    keyForList: countryCode,
                    text: countryName,
                    isSelected: currentCountry === countryCode,
                    searchValue: StringUtils.sanitizeString(`${countryCode}${countryName}`),
                };
            }).sort((a, b) => a.text.localeCompare(b.text)),
        [translate, currentCountry],
    );

    const searchResults = searchOptions(debouncedSearchValue, countries);

    const goBackToSettings = () => Navigation.goBack(ROUTES.WORKSPACE_DISTANCE_RATES_SETTINGS.getRoute(policyID));

    const onSelectCountry = (option: Option) => {
        if (!customUnit || option.value === currentCountry) {
            goBackToSettings();
            return;
        }

        // Picking a country turns the auto-update on with that country, or moves an enabled workspace to the new country
        setWorkspaceDistanceAutoUpdate(policyID, customUnit, true, governmentMileageRates ?? [], policy?.outputCurrency, option.value, currentCountry);
        goBackToSettings();
    };

    const textInputOptions = useMemo(
        () => ({
            headerMessage: debouncedSearchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '',
            label: translate('common.country'),
            value: searchValue,
            onChangeText: setSearchValue,
        }),
        [debouncedSearchValue, searchResults.length, searchValue, translate, setSearchValue],
    );

    const FullPageBlockingView = !customUnit ? FullPageOfflineBlockingView : View;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}
        >
            <ScreenWrapper
                style={styles.pb0}
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="PolicyDistanceRateGovernmentRateCountryPage"
            >
                <HeaderWithBackButton
                    title={translate('common.country')}
                    onBackButtonPress={goBackToSettings}
                />
                <FullPageBlockingView style={customUnit ? styles.flexGrow1 : []}>
                    {!!customUnit && (
                        <SelectionList
                            data={searchResults}
                            ListItem={SingleSelectListItem}
                            onSelectRow={onSelectCountry}
                            textInputOptions={textInputOptions}
                            searchValueForFocusSync={debouncedSearchValue}
                            shouldSingleExecuteRowSelect
                            addBottomSafeAreaPadding
                        />
                    )}
                </FullPageBlockingView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default PolicyDistanceRateGovernmentRateCountryPage;
