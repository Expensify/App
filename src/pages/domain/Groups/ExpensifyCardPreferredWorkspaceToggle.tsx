import {domainSecurityGroupSettingErrorsSelector, domainSecurityGroupSettingPendingActionSelector, selectGroupByID} from '@selectors/Domain';
import React from 'react';
import {View} from 'react-native';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearDomainSecurityGroupSettingError, updateDomainSecurityGroup} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';

type ExpensifyCardPreferredWorkspaceToggleProps = {
    /** The account ID of the domain */
    domainAccountID: number;

    /** The ID of the security group */
    groupID: string;
};

function ExpensifyCardPreferredWorkspaceToggle({domainAccountID, groupID}: ExpensifyCardPreferredWorkspaceToggleProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();

    const [group] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: selectGroupByID(groupID),
    });

    const [overridePreferredPolicyWithCardPolicyPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        selector: domainSecurityGroupSettingPendingActionSelector('overridePreferredPolicyWithCardPolicy', groupID),
    });
    const [overridePreferredPolicyWithCardPolicyErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        selector: domainSecurityGroupSettingErrorsSelector('overridePreferredPolicyWithCardPolicyErrors', groupID),
    });

    const preferredPolicyID = group?.restrictedPrimaryPolicyID;
    const isPreferredPolicyEnabled = !!group?.enableRestrictedPrimaryPolicy && !!preferredPolicyID;

    const [domainCardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${domainAccountID}`);
    const isDomainUsingExpensifyCard = !!domainCardSettings;

    const isActive = !!group?.overridePreferredPolicyWithCardPolicy;
    const isDisabled = (!isPreferredPolicyEnabled || !isDomainUsingExpensifyCard) && !isActive;

    return (
        <View style={styles.mv3}>
            <ToggleSettingOptionRow
                title={translate('domain.groups.expensifyCardPreferredWorkspace')}
                subtitle={translate('domain.groups.expensifyCardPreferredWorkspaceDescription')}
                switchAccessibilityLabel={translate('domain.groups.expensifyCardPreferredWorkspace')}
                shouldPlaceSubtitleBelowSwitch
                disabled={isDisabled}
                disabledAction={() => {
                    showConfirmModal({
                        title: translate('workspace.distanceRates.oopsNotSoFast'),
                        prompt: translate('domain.groups.expensifyCardPreferredWorkspaceDisabledMessage'),
                        confirmText: translate('common.buttonConfirm'),
                        shouldShowCancelButton: false,
                    });
                }}
                isActive={isActive}
                onToggle={(enabled) => {
                    if (!group) {
                        return;
                    }
                    updateDomainSecurityGroup(domainAccountID, groupID, group, {overridePreferredPolicyWithCardPolicy: enabled}, 'overridePreferredPolicyWithCardPolicy');
                }}
                wrapperStyle={styles.ph5}
                pendingAction={overridePreferredPolicyWithCardPolicyPendingAction}
                errors={overridePreferredPolicyWithCardPolicyErrors}
                onCloseError={() => clearDomainSecurityGroupSettingError(domainAccountID, groupID, 'overridePreferredPolicyWithCardPolicyErrors')}
            />
        </View>
    );
}

export default ExpensifyCardPreferredWorkspaceToggle;
