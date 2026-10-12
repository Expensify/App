/**
 * Shared preferred-workspace selector for domain groups. Both the group-create and group-edit
 * pages delegate to this component; it renders the admin workspace list with a search field and
 * gates access behind DomainNotFoundPageWrapper.
 */
import type {FullPageNotFoundViewProps} from '@components/BlockingViews/FullPageNotFoundView';
import CollapsibleHeaderOnKeyboard from '@components/CollapsibleHeaderOnKeyboard';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useInitialSelection from '@hooks/useInitialSelection';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchResults from '@hooks/useSearchResults';
import useShouldFooterBeInsideList from '@hooks/useShouldFooterBeInsideList';
import useThemeStyles from '@hooks/useThemeStyles';

import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {createAdminPoliciesSelector} from '@selectors/Policy';
import React, {useState} from 'react';

type WorkspaceListItem = {
    policyID: string;

    /** Value used to match the pinned selection */
    value: string;

    /** The timestamp of when the policy was created */
    created?: string;
} & ListItem;

type BaseDomainGroupPreferredWorkspacePageProps = {
    /** AccountID of the domain */
    domainAccountID: number;

    /** The policy ID of the saved preferred workspace */
    selectedPolicyID: string | undefined;

    /** Called with the policy ID of the workspace the user picked */
    onSelectWorkspace: (policyID: string) => void;

    /** Whether a pick is staged behind a Save button, which WCAG 3.2.2 "On Input" requires when committing navigates away */
    shouldConfirmSelection?: boolean;

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
    onSelectWorkspace,
    shouldConfirmSelection = false,
    onBackButtonPress,
    testID,
    shouldBeBlocked,
    fullPageNotFoundViewProps,
}: BaseDomainGroupPreferredWorkspacePageProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();

    const [draftPolicyID, setDraftPolicyID] = useState<string>();
    const checkedPolicyID = draftPolicyID ?? selectedPolicyID;
    // Freeze the workspace selected when the page opened so it stays pinned to the top for the whole open/focus cycle, even as the live selection changes.
    const initialPolicyID = useInitialSelection(checkedPolicyID, {resetOnFocus: true});

    const shouldFooterBeInsideList = useShouldFooterBeInsideList();

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createAdminPoliciesSelector(selectedPolicyID)});

    const workspaceOptions: WorkspaceListItem[] = [];
    for (const policy of Object.values(policies ?? {})) {
        if (!policy?.name || !policy?.id) {
            continue;
        }

        workspaceOptions.push({
            text: policy.name,
            policyID: policy.id,
            value: policy.id,
            created: policy.created,
            keyForList: policy.id,
            isSelected: checkedPolicyID === policy.id,
        });
    }
    workspaceOptions.sort((a, b) => localeCompare(a.created ?? '', b.created ?? ''));

    // Pin the frozen initial workspace to the top of the full list before searching, so the pre-selected workspace stays pinned while searching.
    const orderedWorkspaceOptions = moveInitialSelectionToTop(workspaceOptions, initialPolicyID ? [initialPolicyID] : []);

    const [searchTerm, setSearchTerm, filteredWorkspaceOptions] = useSearchResults(
        orderedWorkspaceOptions,
        (option, searchInput) => tokenizedSearch([option], searchInput, () => [option.text ?? '']).length > 0,
    );

    // The search input is gated on the unfiltered list length so it doesn't disappear once a query narrows the results.
    const shouldShowSearchInput = workspaceOptions.length >= CONST.STANDARD_LIST_ITEM_LIMIT;

    const confirmButtonOptions = shouldConfirmSelection
        ? {
              showButton: true,
              text: translate('common.save'),
              onConfirm: () => {
                  if (!checkedPolicyID) {
                      return;
                  }
                  onSelectWorkspace(checkedPolicyID);
              },
              isDisabled: checkedPolicyID === selectedPolicyID,
          }
        : undefined;

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
                <CollapsibleHeaderOnKeyboard alwaysCollapseHeaderOnKeyboard>
                    <HeaderWithBackButton
                        title={translate('domain.groups.preferredWorkspace')}
                        onBackButtonPress={onBackButtonPress}
                    />
                    <Text style={[styles.ph5, styles.mb3]}>{translate('domain.groups.preferredWorkspaceSelectDescription')}</Text>
                </CollapsibleHeaderOnKeyboard>
                <SelectionList<WorkspaceListItem>
                    data={filteredWorkspaceOptions}
                    ListItem={UserListItem}
                    textInputOptions={{
                        label: shouldShowSearchInput ? translate('common.search') : undefined,
                        value: searchTerm,
                        onChangeText: setSearchTerm,
                        headerMessage: workspaceOptions.length > 0 && filteredWorkspaceOptions.length === 0 ? translate('common.noResultsFound') : '',
                    }}
                    onSelectRow={(item: WorkspaceListItem) => (shouldConfirmSelection ? setDraftPolicyID(item.policyID) : onSelectWorkspace(item.policyID))}
                    confirmButtonOptions={confirmButtonOptions}
                    initiallyFocusedItemKey={initialPolicyID}
                    shouldScrollToFocusedIndexOnMount={false}
                    shouldUpdateFocusedIndex
                    addBottomSafeAreaPadding
                    shouldFooterBeInsideList={shouldFooterBeInsideList}
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default BaseDomainGroupPreferredWorkspacePage;
