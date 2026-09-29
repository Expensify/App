import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';

import useApplyWorkspaceCurrencyChange from '@hooks/useApplyWorkspaceCurrencyChange';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getGovernmentRateCountryOptions} from '@libs/PolicyDistanceRatesUtils';
import type {Option} from '@libs/searchOptions';
import searchOptions from '@libs/searchOptions';

import type {SettingsNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useState} from 'react';
import {View} from 'react-native';

import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';

type WorkspaceOverviewCurrencyGovernmentRateCountryPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CURRENCY_GOVERNMENT_RATE_COUNTRY>;

function WorkspaceOverviewCurrencyGovernmentRateCountryPage({route}: WorkspaceOverviewCurrencyGovernmentRateCountryPageProps) {
    const {policyID, currencyCode} = route.params;
    const isForcedToChangeCurrency = !!route.params?.isForcedToChangeCurrency;
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    const applyWorkspaceCurrencyChange = useApplyWorkspaceCurrencyChange(policy);

    const [selectedCountry, setSelectedCountry] = useState<string>();

    const countries = getGovernmentRateCountryOptions(translate, localeCompare, selectedCountry);

    const searchResults = searchOptions(debouncedSearchValue, countries);

    const goBackToCurrencyPage = () => Navigation.goBack(ROUTES.WORKSPACE_OVERVIEW_CURRENCY.getRoute(policyID));

    const saveCountry = () => {
        if (!policy || !selectedCountry) {
            goBackToCurrencyPage();
            return;
        }

        // The currency write and the auto-update re-enable both go out from here, then the flow lands back on the overview
        applyWorkspaceCurrencyChange(currencyCode, {
            isForcedToChangeCurrency,
            governmentRateCountry: selectedCountry,
            backTo: ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID),
        });
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

    const FullPageBlockingView = !policy ? FullPageOfflineBlockingView : View;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
        >
            <ScreenWrapper
                style={styles.pb0}
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="WorkspaceOverviewCurrencyGovernmentRateCountryPage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.distanceRates.governmentRateSourceCountry')}
                    onBackButtonPress={goBackToCurrencyPage}
                />
                <FullPageBlockingView style={policy ? styles.flexGrow1 : []}>
                    {!!policy && (
                        <>
                            <Text style={[styles.textNormal, styles.mh5, styles.mb3]}>{translate('workspace.distanceRates.governmentRateCountrySelectionPrompt')}</Text>
                            <SelectionList
                                data={searchResults}
                                ListItem={SingleSelectListItem}
                                onSelectRow={(option: Option) => setSelectedCountry(option.value)}
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
                        </>
                    )}
                </FullPageBlockingView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceOverviewCurrencyGovernmentRateCountryPage;
