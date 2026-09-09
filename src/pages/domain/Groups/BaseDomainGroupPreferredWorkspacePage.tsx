/**
 * Shared preferred-workspace selector for domain groups. Both the group-create and group-edit
 * pages delegate to this component; it renders the admin workspace list with a search field and
 * gates access behind DomainNotFoundPageWrapper.
 */
import type {FullPageNotFoundViewProps} from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import type {ConfirmButtonOptions, ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';

import tokenizedSearch from '@libs/tokenizedSearch';

import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {createAdminPoliciesSelector} from '@selectors/Policy';
import React from 'react';

type WorkspaceListItem = {
    policyID: string;

    /** The timestamp of when the policy was created */
    created?: string;
} & ListItem;

type BaseDomainGroupPreferredWorkspacePageProps = {
    /** AccountID of the domain */
    domainAccountID: number;

    /** The policy ID of the saved preferred workspace. It stays in the list even when the user is not its admin, and it is the row focused on open. */
    selectedPolicyID: string | undefined;

    /** The policy ID to check instead of `selectedPolicyID`, for pages that stage the pick and only commit it on Save */
    draftPolicyID?: string;

    /** Called with the policy ID of the workspace the user picked */
    onSelectWorkspace: (policyID: string) => void;

    /** Options for the footer confirm button. Omit it on pages that commit the pick as soon as a row is selected. */
    confirmButtonOptions?: ConfirmButtonOptions<WorkspaceListItem>;

    /** Called when the back button is pressed */
    onBackButtonPress: () => void;

    /** Used to locate the page in the tests */
    testID: string;

    /** Whether or not to block user from accessing the page */
    shouldBeBlocked?: boolean;

    /** Props for customizing fallback pages */
    fullPageNotFoundViewProps?: FullPageNotFoundViewProps;
};

function BaseDomainGroupPreferredWorkspacePage({
    domainAccountID,
    selectedPolicyID,
    draftPolicyID,
    onSelectWorkspace,
    confirmButtonOptions,
    onBackButtonPress,
    testID,
    shouldBeBlocked,
    fullPageNotFoundViewProps,
}: BaseDomainGroupPreferredWorkspacePageProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();

    // The saved workspace drives which rows the list contains and which one opens focused, so staging a pick can't drop it or move the list under the user.
    const checkedPolicyID = draftPolicyID ?? selectedPolicyID;

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createAdminPoliciesSelector(selectedPolicyID)});

    const workspaceOptions: WorkspaceListItem[] = [];
    for (const policy of Object.values(policies ?? {})) {
        if (!policy?.name || !policy?.id) {
            continue;
        }

        workspaceOptions.push({
            text: policy.name,
            policyID: policy.id,
            created: policy.created,
            keyForList: policy.id,
            isSelected: checkedPolicyID === policy.id,
        });
    }
    workspaceOptions.sort((a, b) => localeCompare(a.created ?? '', b.created ?? ''));

    const [searchTerm, setSearchTerm, filteredWorkspaceOptions] = useSearchResults(
        workspaceOptions,
        (option, searchInput) => tokenizedSearch([option], searchInput, () => [option.text ?? '']).length > 0,
    );

    // The search input is gated on the unfiltered list length so it doesn't disappear once a query narrows the results.
    const shouldShowSearchInput = workspaceOptions.length >= CONST.STANDARD_LIST_ITEM_LIMIT;

    return (
        <DomainNotFoundPageWrapper
            domainAccountID={domainAccountID}
            shouldBeBlocked={shouldBeBlocked}
            fullPageNotFoundViewProps={fullPageNotFoundViewProps}
        >
            <ScreenWrapper
                shouldEnableMaxHeight
                testID={testID}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('domain.groups.preferredWorkspace')}
                    onBackButtonPress={onBackButtonPress}
                />
                <Text style={[styles.ph5, styles.mb3]}>{translate('domain.groups.preferredWorkspaceSelectDescription')}</Text>
                <SelectionList<WorkspaceListItem>
                    data={filteredWorkspaceOptions}
                    ListItem={UserListItem}
                    textInputOptions={{
                        label: shouldShowSearchInput ? translate('common.search') : undefined,
                        value: searchTerm,
                        onChangeText: setSearchTerm,
                        headerMessage: workspaceOptions.length > 0 && filteredWorkspaceOptions.length === 0 ? translate('common.noResultsFound') : '',
                    }}
                    onSelectRow={(item: WorkspaceListItem) => onSelectWorkspace(item.policyID)}
                    confirmButtonOptions={confirmButtonOptions}
                    initiallyFocusedItemKey={selectedPolicyID}
                    shouldUpdateFocusedIndex
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default BaseDomainGroupPreferredWorkspacePage;
