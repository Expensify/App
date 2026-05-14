import {domainSecurityGroupSettingErrorsSelector, domainSecurityGroupSettingPendingActionSelector, selectGroupByID} from '@selectors/Domain';
import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearDomainSecurityGroupSettingError, updateDomainSecurityGroup} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';

type RestrictDefaultLoginSelectionToggleProps = {
    /** The account ID of the domain */
    domainAccountID: number;

    /** The ID of the security group */
    groupID: string;
};

function RestrictDefaultLoginSelectionToggle({domainAccountID, groupID}: RestrictDefaultLoginSelectionToggleProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [group] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: selectGroupByID(groupID),
    });

    const [enableRestrictedPrimaryLoginPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        selector: domainSecurityGroupSettingPendingActionSelector('enableRestrictedPrimaryLogin', groupID),
    });
    const [enableRestrictedPrimaryLoginErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        selector: domainSecurityGroupSettingErrorsSelector('enableRestrictedPrimaryLoginErrors', groupID),
    });

    const isEnabled = !!group?.enableRestrictedPrimaryLogin;

    return (
        <View style={styles.mv3}>
            <ToggleSettingOptionRow
                title={translate('domain.groups.restrictDefaultLoginSelection')}
                subtitle={translate('domain.groups.restrictDefaultLoginSelectionDescription')}
                switchAccessibilityLabel={translate('domain.groups.restrictDefaultLoginSelection')}
                shouldPlaceSubtitleBelowSwitch
                isActive={isEnabled}
                onToggle={(enabled) => {
                    if (!group) {
                        return;
                    }
                    updateDomainSecurityGroup(domainAccountID, groupID, group, {enableRestrictedPrimaryLogin: enabled}, 'enableRestrictedPrimaryLogin');
                }}
                wrapperStyle={[styles.ph5]}
                pendingAction={enableRestrictedPrimaryLoginPendingAction}
                errors={enableRestrictedPrimaryLoginErrors}
                onCloseError={() => clearDomainSecurityGroupSettingError(domainAccountID, groupID, 'enableRestrictedPrimaryLoginErrors')}
            />
        </View>
    );
}

export default RestrictDefaultLoginSelectionToggle;
