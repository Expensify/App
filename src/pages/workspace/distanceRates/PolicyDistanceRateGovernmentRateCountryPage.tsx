import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
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
import {getGovernmentRateCountryOptions} from '@libs/PolicyDistanceRatesUtils';
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';
import type {Option} from '@libs/searchOptions';
import searchOptions from '@libs/searchOptions';

import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {setWorkspaceDistanceAutoUpdate} from '@userActions/Policy/DistanceRate';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useState} from 'react';
import {View} from 'react-native';

type PolicyDistanceRateGovernmentRateCountryPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATES_GOVERNMENT_RATE_COUNTRY>;

function PolicyDistanceRateGovernmentRateCountryPage({route}: PolicyDistanceRateGovernmentRateCountryPageProps) {
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [governmentMileageRates] = useOnyx(ONYXKEYS.GOVERNMENT_MILEAGE_RATES);
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    const customUnit = getDistanceRateCustomUnit(policy);
    const currentCountry = policy?.autoUpdateGovernmentRateCountry;

    // The stored country can load after first render, so only an explicit pick overrides it
    const [pickedCountry, setPickedCountry] = useState<string>();
    const selectedCountry = pickedCountry ?? currentCountry;

    const countries = getGovernmentRateCountryOptions(translate, localeCompare, selectedCountry);

    const searchResults = searchOptions(debouncedSearchValue, countries);

    const goBackToSettings = () => Navigation.goBack(ROUTES.WORKSPACE_DISTANCE_RATES_SETTINGS.getRoute(policyID));

    const saveCountry = () => {
        if (!customUnit || !selectedCountry || selectedCountry === currentCountry) {
            goBackToSettings();
            return;
        }

        // Saving a country turns the auto-update on with that country, or moves an enabled workspace to the new country
        setWorkspaceDistanceAutoUpdate(policyID, customUnit, true, governmentMileageRates ?? [], policy?.outputCurrency, selectedCountry, currentCountry);
        goBackToSettings();
    };

    const textInputOptions =
        countries.length >= CONST.STANDARD_LIST_ITEM_LIMIT
            ? {
                  headerMessage: debouncedSearchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '',
                  label: translate('common.country'),
                  value: searchValue,
                  onChangeText: setSearchValue,
              }
            : undefined;

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
                            onSelectRow={(option: Option) => setPickedCountry(option.value)}
                            textInputOptions={textInputOptions}
                            searchValueForFocusSync={debouncedSearchValue}
                            shouldSingleExecuteRowSelect
                            addBottomSafeAreaPadding
                            footerContent={
                                <FormAlertWithSubmitButton
                                    buttonText={translate('common.save')}
                                    onSubmit={saveCountry}
                                    isDisabled={!selectedCountry}
                                    enabledWhenOffline
                                    containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                                />
                            }
                        />
                    )}
                </FullPageBlockingView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default PolicyDistanceRateGovernmentRateCountryPage;
