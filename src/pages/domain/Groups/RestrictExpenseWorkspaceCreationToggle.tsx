import {domainSecurityGroupSettingErrorsSelector, domainSecurityGroupSettingPendingActionSelector, selectGroupByID} from '@selectors/Domain';
import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearDomainSecurityGroupSettingError, updateDomainSecurityGroup} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';

type RestrictExpenseWorkspaceCreationToggleProps = {
    /** The account ID of the domain */
    domainAccountID: number;

    /** The ID of the security group */
    groupID: string;
};

function RestrictExpenseWorkspaceCreationToggle({domainAccountID, groupID}: RestrictExpenseWorkspaceCreationToggleProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [group] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: selectGroupByID(groupID),
    });

    const [enableRestrictedPolicyCreationPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        selector: domainSecurityGroupSettingPendingActionSelector('enableRestrictedPolicyCreation', groupID),
    });
    const [enableRestrictedPolicyCreationErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        selector: domainSecurityGroupSettingErrorsSelector('enableRestrictedPolicyCreationErrors', groupID),
    });

    const isEnabled = !!group?.enableRestrictedPolicyCreation;

    return (
        <View style={styles.mv3}>
            <ToggleSettingOptionRow
                title={translate('domain.groups.restrictExpenseWorkspaceCreation')}
                subtitle={translate('domain.groups.restrictExpenseWorkspaceCreationDescription')}
                switchAccessibilityLabel={translate('domain.groups.restrictExpenseWorkspaceCreation')}
                shouldPlaceSubtitleBelowSwitch
                isActive={isEnabled}
                onToggle={(enabled) => {
                    if (!group) {
                        return;
                    }
                    updateDomainSecurityGroup(domainAccountID, groupID, group, {enableRestrictedPolicyCreation: enabled}, 'enableRestrictedPolicyCreation');
                }}
                wrapperStyle={[styles.ph5]}
                pendingAction={enableRestrictedPolicyCreationPendingAction}
                errors={enableRestrictedPolicyCreationErrors}
                onCloseError={() => clearDomainSecurityGroupSettingError(domainAccountID, groupID, 'enableRestrictedPolicyCreationErrors')}
            />
        </View>
    );
}

export default RestrictExpenseWorkspaceCreationToggle;
