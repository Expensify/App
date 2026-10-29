import BlockingView from '@components/BlockingViews/BlockingView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceMembers from '@hooks/useWorkspaceMembers';

import {updateDraftMerchantRule} from '@libs/actions/User';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import useMerchantRuleRoute from './useMerchantRuleRoute';
import useRuleConditionSelection from './useRuleConditionSelection';

type AddSubmitterToMatchPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.RULES_SUBMITTER_TO_MATCH | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_SUBMITTER_TO_MATCH
>;

type SubmitterListItem = ListItem & {
    value: string;
};

function AddSubmitterToMatchPage({route}: AddSubmitterToMatchPageProps) {
    const {policyID, ruleID} = route.params;
    const {backToRoute} = useMerchantRuleRoute(DYNAMIC_ROUTES.RULES_SUBMITTER_TO_MATCH_FROM_EXPENSE.path, policyID, ruleID);
    const styles = useThemeStyles();
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policy = usePolicy(policyID);
    const members = useWorkspaceMembers(policy);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);

    const {
        selectedValues: selectedSubmitters,
        initialSelectedValues: initialSelectedSubmitters,
        toggleValue: toggleSubmitterValue,
        toggleAll,
    } = useRuleConditionSelection(form?.submittersToMatch ?? []);

    // Stored as account IDs, which is what the `from` filter carries.
    const submitterItems: SubmitterListItem[] = members.map(({accountID, details}) => ({
        keyForList: String(accountID),
        text: temporaryGetDisplayNameOrDefault({passedPersonalDetails: details, translate, formatPhoneNumber}),
        alternateText: details.login,
        value: String(accountID),
        isSelected: selectedSubmitters.includes(String(accountID)),
    }));

    // A rule keeps matching on someone who has since left the workspace. Listing them is the only way to see what
    // the rule matches on and the only way to take them off, so they are added back rather than left out.
    const listedAccountIDs = new Set(submitterItems.map((item) => item.value));
    for (const accountID of selectedSubmitters) {
        if (listedAccountIDs.has(accountID)) {
            continue;
        }
        submitterItems.push({keyForList: accountID, text: accountID, value: accountID, isSelected: true});
    }

    const filterSubmitter = (item: SubmitterListItem, searchInput: string) =>
        tokenizedSearch([item], searchInput, (submitter) => [submitter.text ?? '', submitter.alternateText ?? '']).length > 0;

    // Pin the initially selected members to the top of the FULL sorted list, then let the search filter run over
    // the already-pinned list so pinned rows stay at the top even while searching.
    const sortedSubmitterItems = moveInitialSelectionToTop(
        [...submitterItems].sort((a, b) => localeCompare(a.text ?? '', b.text ?? '')),
        initialSelectedSubmitters,
    );

    const [inputValue, setInputValue, filteredSubmitterItems] = useSearchResults(sortedSubmitterItems, filterSubmitter);

    const toggleSubmitter = (item: SubmitterListItem) => toggleSubmitterValue(item.value);
    const toggleSelectAll = () => toggleAll(filteredSubmitterItems.map((item) => item.value));

    const goBackToRule = () => Navigation.goBack(backToRoute);

    // Clearing every member leaves the rule applying to everyone, which is what the row reads as when unset.
    const handleSave = () => {
        updateDraftMerchantRule({submittersToMatch: selectedSubmitters});
        Navigation.goBack(backToRoute, {shouldSkipFocusRestore: true});
    };

    return (
        <ScreenWrapper
            testID="AddSubmitterToMatchPage"
            shouldEnableMaxHeight
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButtonAndTitle
                title={translate('common.submitter')}
                onBackButtonPress={goBackToRule}
            />
            <SelectionList
                canSelectMultiple
                shouldUpdateFocusedIndex
                ListItem={MultiSelectListItem}
                data={filteredSubmitterItems}
                selectedItems={selectedSubmitters}
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                onSelectRow={toggleSubmitter}
                onSelectionButtonPress={toggleSubmitter}
                onSelectAll={filteredSubmitterItems.length > 0 ? toggleSelectAll : undefined}
                textInputOptions={
                    sortedSubmitterItems.length >= CONST.STANDARD_LIST_ITEM_LIMIT
                        ? {
                              value: inputValue,
                              label: translate('common.search'),
                              onChangeText: setInputValue,
                          }
                        : undefined
                }
                style={{
                    listHeaderWrapperStyle: [styles.pt5, styles.pb2],
                    listHeaderSelectAllTextStyle: [styles.textLabelSupporting],
                }}
                listEmptyContent={
                    <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                        <BlockingView
                            icon={illustrations.Telescope}
                            iconWidth={variables.emptyListIconWidth}
                            iconHeight={variables.emptyListIconHeight}
                            title={translate('common.noResultsFound')}
                        />
                    </ScrollView>
                }
                footerContent={
                    <FormAlertWithSubmitButton
                        buttonText={translate('common.save')}
                        isAlertVisible={false}
                        onSubmit={handleSave}
                        enabledWhenOffline
                        containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                    />
                }
            />
        </ScreenWrapper>
    );
}

export default AddSubmitterToMatchPage;
