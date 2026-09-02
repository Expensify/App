import type {FullPageNotFoundViewProps} from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import tokenizedSearch from '@libs/tokenizedSearch';

import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {createAdminPoliciesSelector} from '@selectors/Policy';
import React from 'react';

type WorkspaceListItem = {
    /** The ID of the policy/workspace */
    policyID: string;

    /** The timestamp of when the policy was created */
    created?: string;
} & ListItem;

type BaseDomainGroupPreferredWorkspacePageProps = {
    /** AccountID of the domain */
    domainAccountID: number;

    /** The policy ID of the currently selected preferred workspace */
    selectedPolicyID: string | undefined;

    /** Called with the policy ID of the workspace the user picked */
    onSelectWorkspace: (policyID: string) => void;

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
    onBackButtonPress,
    testID,
    shouldBeBlocked,
    fullPageNotFoundViewProps,
}: BaseDomainGroupPreferredWorkspacePageProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');

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
            isSelected: selectedPolicyID === policy.id,
        });
    }
    workspaceOptions.sort((a, b) => localeCompare(a.created ?? '', b.created ?? ''));

    const filteredWorkspaceOptions = tokenizedSearch(workspaceOptions, debouncedSearchTerm, (option) => [option.text ?? '']);

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
                includeSafeAreaPaddingBottom
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
                    initiallyFocusedItemKey={selectedPolicyID}
                    shouldUpdateFocusedIndex
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default BaseDomainGroupPreferredWorkspacePage;
