import {defaultSecurityGroupIDSelector, domainSecurityGroupSettingErrorsSelector, domainSecurityGroupSettingPendingActionSelector, selectGroupByID} from '@selectors/Domain';
import React from 'react';
import {View} from 'react-native';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearDomainSecurityGroupSettingError, setDefaultSecurityGroup} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';

type DefaultGroupToggleProps = {
    domainAccountID: number;
    groupID: string;
    groupName?: string;
};

function DefaultGroupToggle({domainAccountID, groupID, groupName}: DefaultGroupToggleProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [defaultSecurityGroupID] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: defaultSecurityGroupIDSelector,
    });
    const [defaultSecurityGroup] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: selectGroupByID(defaultSecurityGroupID),
    });
    const [defaultSecurityGroupIDPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        selector: domainSecurityGroupSettingPendingActionSelector('defaultSecurityGroupID', groupID),
    });
    const [defaultSecurityGroupIDErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        selector: domainSecurityGroupSettingErrorsSelector('defaultSecurityGroupIDErrors', groupID),
    });

    const {showConfirmModal} = useConfirmModal();

    const onDefaultGroupToggle = async () => {
        if (!defaultSecurityGroup?.name || !groupName) {
            return;
        }

        const result = await showConfirmModal({
            title: translate('domain.groups.defaultGroup'),
            prompt: translate('domain.groups.defaultGroupPrompt', defaultSecurityGroup.name, groupName),
            confirmText: translate('domain.groups.makeDefault'),
            cancelText: translate('domain.groups.neverMind'),
            shouldShowCancelButton: true,
        });

        if (result.action !== ModalActions.CONFIRM) {
            return;
        }

        setDefaultSecurityGroup(domainAccountID, groupID, defaultSecurityGroupID);
    };

    const isDefault = defaultSecurityGroupID === groupID;

    return (
        <View style={styles.mv3}>
            <ToggleSettingOptionRow
                title={translate('domain.groups.defaultGroup')}
                switchAccessibilityLabel={translate('domain.groups.defaultGroup')}
                isActive={isDefault}
                disabled={isDefault}
                onToggle={() => {
                    onDefaultGroupToggle();
                }}
                pendingAction={defaultSecurityGroupIDPendingAction}
                wrapperStyle={styles.ph5}
                errors={defaultSecurityGroupIDErrors}
                onCloseError={() => clearDomainSecurityGroupSettingError(domainAccountID, groupID, 'defaultSecurityGroupIDErrors')}
            />
        </View>
    );
}

export default DefaultGroupToggle;
