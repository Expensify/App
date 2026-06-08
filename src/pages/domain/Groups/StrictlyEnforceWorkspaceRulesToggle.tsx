import {domainSecurityGroupSettingErrorsSelector, domainSecurityGroupSettingPendingActionSelector, selectGroupByID} from '@selectors/Domain';
import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearDomainSecurityGroupSettingError, updateDomainSecurityGroup} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';

type StrictlyEnforceWorkspaceRulesToggleProps = {
    /** The account ID of the domain */
    domainAccountID: number;

    /** The ID of the security group */
    groupID: string;
};

function StrictlyEnforceWorkspaceRulesToggle({domainAccountID, groupID}: StrictlyEnforceWorkspaceRulesToggleProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [group] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: selectGroupByID(groupID),
    });

    const [enableStrictPolicyRulesPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        selector: domainSecurityGroupSettingPendingActionSelector('enableStrictPolicyRules', groupID),
    });
    const [enableStrictPolicyRulesErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        selector: domainSecurityGroupSettingErrorsSelector('enableStrictPolicyRulesErrors', groupID),
    });

    const isEnabled = !!group?.enableStrictPolicyRules;

    return (
        <View style={styles.mv3}>
            <ToggleSettingOptionRow
                title={translate('domain.groups.strictlyEnforceWorkspaceRules')}
                subtitle={translate('domain.groups.strictlyEnforceWorkspaceRulesDescription')}
                switchAccessibilityLabel={translate('domain.groups.strictlyEnforceWorkspaceRules')}
                shouldPlaceSubtitleBelowSwitch
                isActive={isEnabled}
                onToggle={(enabled) => {
                    if (!group) {
                        return;
                    }
                    updateDomainSecurityGroup(domainAccountID, groupID, group, {enableStrictPolicyRules: enabled}, 'enableStrictPolicyRules');
                }}
                wrapperStyle={[styles.ph5]}
                pendingAction={enableStrictPolicyRulesPendingAction}
                errors={enableStrictPolicyRulesErrors}
                onCloseError={() => clearDomainSecurityGroupSettingError(domainAccountID, groupID, 'enableStrictPolicyRulesErrors')}
            />
        </View>
    );
}

export default StrictlyEnforceWorkspaceRulesToggle;
