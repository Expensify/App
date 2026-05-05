import {domainSecurityGroupSettingErrorsSelector, domainSecurityGroupSettingPendingActionSelector, selectGroupByID} from '@selectors/Domain';
import {createAdminPoliciesSelector, policyNameSelector} from '@selectors/Policy';
import React, {useState} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearDomainSecurityGroupSettingError, updateDomainSecurityGroup} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type PreferredWorkspaceToggleProps = {
    /** The account ID of the domain */
    domainAccountID: number;

    /** The ID of the security group */
    groupID: string;
};

function PreferredWorkspaceToggle({domainAccountID, groupID}: PreferredWorkspaceToggleProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [isNoWorkspacesModalVisible, setIsNoWorkspacesModalVisible] = useState(false);

    const [group] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: selectGroupByID(groupID),
    });

    const [adminPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createAdminPoliciesSelector()});
    const firstAdminPolicy = Object.values(adminPolicies ?? {})
        .sort((a, b) => localeCompare(a?.created ?? '', b?.created ?? ''))
        .at(0);
    const hasAdminPolicies = !!firstAdminPolicy;

    const isEnabled = !!group?.enableRestrictedPrimaryPolicy;
    const preferredPolicyID = group?.restrictedPrimaryPolicyID;

    const [preferredPolicyName] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${preferredPolicyID}`, {selector: policyNameSelector});

    const [enableRestrictedPrimaryPolicyPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        selector: domainSecurityGroupSettingPendingActionSelector('enableRestrictedPrimaryPolicy', groupID),
    });
    const [enableRestrictedPrimaryPolicyErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        selector: domainSecurityGroupSettingErrorsSelector('enableRestrictedPrimaryPolicyErrors', groupID),
    });

    const [restrictedPrimaryPolicyIDPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        selector: domainSecurityGroupSettingPendingActionSelector('restrictedPrimaryPolicyID', groupID),
    });
    const [restrictedPrimaryPolicyIDErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        selector: domainSecurityGroupSettingErrorsSelector('restrictedPrimaryPolicyIDErrors', groupID),
    });

    return (
        <>
            <View style={styles.mv3}>
                <ToggleSettingOptionRow
                    title={translate('domain.groups.preferredWorkspace')}
                    subtitle={translate('domain.groups.preferredWorkspaceDescription', isEnabled)}
                    switchAccessibilityLabel={translate('domain.groups.preferredWorkspace')}
                    shouldPlaceSubtitleBelowSwitch
                    isActive={isEnabled}
                    disabled={!hasAdminPolicies && !isEnabled}
                    disabledAction={() => setIsNoWorkspacesModalVisible(true)}
                    onToggle={(enabled) => {
                        if (!group?.name) {
                            return;
                        }
                        updateDomainSecurityGroup(
                            domainAccountID,
                            groupID,
                            group,
                            {
                                enableRestrictedPrimaryPolicy: enabled,
                                ...(enabled &&
                                    !preferredPolicyID &&
                                    firstAdminPolicy?.id && {
                                        restrictedPrimaryPolicyID: firstAdminPolicy?.id,
                                    }),
                            },
                            'enableRestrictedPrimaryPolicy',
                        );
                    }}
                    wrapperStyle={[styles.ph5]}
                    pendingAction={enableRestrictedPrimaryPolicyPendingAction}
                    errors={enableRestrictedPrimaryPolicyErrors}
                    onCloseError={() => clearDomainSecurityGroupSettingError(domainAccountID, groupID, 'enableRestrictedPrimaryPolicyErrors')}
                />
            </View>
            <ConfirmModal
                onConfirm={() => setIsNoWorkspacesModalVisible(false)}
                onCancel={() => setIsNoWorkspacesModalVisible(false)}
                isVisible={isNoWorkspacesModalVisible}
                title={translate('workspace.distanceRates.oopsNotSoFast')}
                prompt={translate('domain.groups.noWorkspacesMessage')}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
            />
            {hasAdminPolicies && (
                <OfflineWithFeedback
                    pendingAction={restrictedPrimaryPolicyIDPendingAction}
                    errors={restrictedPrimaryPolicyIDErrors}
                    onClose={() => clearDomainSecurityGroupSettingError(domainAccountID, groupID, 'restrictedPrimaryPolicyIDErrors')}
                    errorRowStyles={[styles.mh5]}
                >
                    <MenuItemWithTopDescription
                        description={translate('domain.groups.preferredWorkspace')}
                        title={preferredPolicyName ?? firstAdminPolicy?.name}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.DOMAIN_SECURITY_GROUPS_PREFERRED_WORKSPACE.getRoute(domainAccountID, groupID))}
                        disabled={!isEnabled}
                    />
                </OfflineWithFeedback>
            )}
        </>
    );
}

export default PreferredWorkspaceToggle;
