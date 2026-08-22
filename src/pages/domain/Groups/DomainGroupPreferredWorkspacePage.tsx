import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';

import {updateDomainSecurityGroup} from '@userActions/Domain';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {domainSecurityGroupSettingPendingActionSelector, selectGroupByID} from '@selectors/Domain';
import {createAdminPoliciesSelector} from '@selectors/Policy';
import React, {useState} from 'react';

type WorkspaceListItem = {
    policyID: string;
    created?: string;
} & ListItem;

type DomainGroupPreferredWorkspacePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.SECURITY_GROUPS_PREFERRED_WORKSPACE>;

function DomainGroupPreferredWorkspacePage({route}: DomainGroupPreferredWorkspacePageProps) {
    const {domainAccountID, groupID} = route.params;

    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();

    const [group] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: selectGroupByID(groupID),
    });

    const [deleteGroupPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        selector: domainSecurityGroupSettingPendingActionSelector('deleteGroup', groupID),
    });

    const currentPolicyID = group?.restrictedPrimaryPolicyID;

    const [selectedPolicyID, setSelectedPolicyID] = useState<string>();
    const currentSelection = selectedPolicyID ?? currentPolicyID;

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createAdminPoliciesSelector(currentPolicyID)});

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
            isSelected: currentSelection === policy.id,
        });
    }

    const saveWorkspace = () => {
        if (!group || !currentSelection) {
            return;
        }
        updateDomainSecurityGroup(domainAccountID, groupID, group, {restrictedPrimaryPolicyID: currentSelection}, 'restrictedPrimaryPolicyID');
        Navigation.goBack(ROUTES.DOMAIN_GROUP_DETAILS.getRoute(domainAccountID, groupID));
    };

    const confirmButtonOptions = {
        showButton: true,
        text: translate('common.save'),
        onConfirm: saveWorkspace,
        isDisabled: currentSelection === currentPolicyID,
    };

    return (
        <DomainNotFoundPageWrapper
            domainAccountID={domainAccountID}
            shouldBeBlocked={!group || !!deleteGroupPendingAction}
            fullPageNotFoundViewProps={{
                onBackButtonPress: () => Navigation.goBack(ROUTES.DOMAIN_GROUPS.getRoute(domainAccountID)),
            }}
        >
            <ScreenWrapper
                shouldEnableMaxHeight
                testID="DomainGroupPreferredWorkspacePage"
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('domain.groups.preferredWorkspace')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.DOMAIN_GROUP_DETAILS.getRoute(domainAccountID, groupID))}
                />
                <Text style={[styles.ph5, styles.mb3]}>{translate('domain.groups.preferredWorkspaceSelectDescription')}</Text>
                <SelectionList<WorkspaceListItem>
                    data={workspaceOptions.sort((a, b) => localeCompare(a.created ?? '', b.created ?? ''))}
                    ListItem={UserListItem}
                    onSelectRow={(item: WorkspaceListItem) => setSelectedPolicyID(item.policyID)}
                    confirmButtonOptions={confirmButtonOptions}
                    initiallyFocusedItemKey={currentPolicyID}
                    shouldUpdateFocusedIndex
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default DomainGroupPreferredWorkspacePage;
