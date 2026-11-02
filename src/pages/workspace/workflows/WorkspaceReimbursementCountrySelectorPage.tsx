/**
 * Lets a workspace admin pick the countries the workspace collects employee deposit accounts for. Countries the
 * workspace has a withdrawal account in stay selected, because the server never removes them.
 */
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';

import useDebouncedState from '@hooks/useDebouncedState';
import useInitialSelection from '@hooks/useInitialSelection';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getPolicyBankAccountCountry, getReimbursementAccountCountries, getReimbursementCountryISOs} from '@libs/PolicyUtils';
import searchOptions from '@libs/searchOptions';
import type {Option} from '@libs/searchOptions';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import StringUtils from '@libs/StringUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';

import {setReimbursementCountries} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import React, {useState} from 'react';

type WorkspaceReimbursementCountrySelectorPageProps = WithPolicyOnyxProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_REIMBURSEMENT_COUNTRIES>;

type CountryOption = Option & {
    isDisabled: boolean;
};

function WorkspaceReimbursementCountrySelectorPage({policy, route}: WorkspaceReimbursementCountrySelectorPageProps) {
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const [policyBankAccountCountry] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {selector: (bankAccountList) => getPolicyBankAccountCountry(policy, bankAccountList)});
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    const accountCountryISOs = getReimbursementAccountCountries(policy, policyBankAccountCountry);
    const savedCountryISOs = getReimbursementCountryISOs(policy?.reimbursement?.countries).filter((countryISO) => countryISO in CONST.ALL_COUNTRIES);
    const initialCountryISOs = [...new Set([...savedCountryISOs, ...accountCountryISOs])];

    const [draftCountryISOs, setDraftCountryISOs] = useState<string[]>();
    const selectedCountryISOs = draftCountryISOs ?? initialCountryISOs;
    const initialSelectedCountryISOs = useInitialSelection(initialCountryISOs, {resetOnFocus: true});

    // The filter keeps every key. It only narrows the type for `translate`
    const countryOptions: CountryOption[] = Object.keys(CONST.ALL_COUNTRIES)
        .filter((countryISO): countryISO is Country => countryISO in CONST.ALL_COUNTRIES)
        .map((countryISO) => {
            const countryName = translate(`allCountries.${countryISO}`);
            return {
                value: countryISO,
                keyForList: countryISO,
                text: countryName,
                isSelected: selectedCountryISOs.includes(countryISO),
                isDisabled: accountCountryISOs.includes(countryISO),
                searchValue: StringUtils.sanitizeString(`${countryISO}${countryName}`),
            };
        });
    const orderedCountryOptions = moveInitialSelectionToTop(countryOptions, initialSelectedCountryISOs);
    const searchResults = searchOptions(debouncedSearchValue, debouncedSearchValue ? countryOptions : orderedCountryOptions);

    const hasChanges = selectedCountryISOs.length !== initialCountryISOs.length || selectedCountryISOs.some((countryISO) => !initialCountryISOs.includes(countryISO));

    const toggleCountry = (option: Option) => {
        if (accountCountryISOs.includes(option.value)) {
            return;
        }
        setDraftCountryISOs(selectedCountryISOs.includes(option.value) ? selectedCountryISOs.filter((countryISO) => countryISO !== option.value) : [...selectedCountryISOs, option.value]);
    };

    const saveReimbursementCountries = () => {
        if (policy?.id && hasChanges) {
            setReimbursementCountries(policy.id, selectedCountryISOs, policy.reimbursement?.countries);
        }
        Navigation.goBack();
    };

    const textInputOptions = {
        label: translate('common.search'),
        value: searchValue,
        onChangeText: setSearchValue,
        headerMessage: debouncedSearchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '',
    };

    const confirmButtonOptions = {
        showButton: true,
        text: translate('common.save'),
        onConfirm: saveReimbursementCountries,
        isDisabled: !hasChanges,
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.WORKFLOWS_PAYMENTS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.COLLECT_DEPOSIT_ACCOUNTS)}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="WorkspaceReimbursementCountrySelectorPage"
            >
                <HeaderWithBackButtonAndTitle
                    title={translate('workflowsPage.businessBankAccountCountries')}
                    onBackButtonPress={Navigation.goBack}
                />
                <SelectionList
                    data={searchResults}
                    ListItem={MultiSelectListItem}
                    canSelectMultiple
                    onSelectRow={toggleCountry}
                    textInputOptions={textInputOptions}
                    searchValueForFocusSync={debouncedSearchValue}
                    confirmButtonOptions={confirmButtonOptions}
                    disableMaintainingScrollPosition
                    shouldUpdateFocusedIndex
                    shouldScrollToFocusedIndexOnMount={false}
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceReimbursementCountrySelectorPage.displayName = 'WorkspaceReimbursementCountrySelectorPage';

export default withPolicy(WorkspaceReimbursementCountrySelectorPage);
