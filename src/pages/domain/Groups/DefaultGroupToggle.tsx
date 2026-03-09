import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import React from 'react';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import {clearDefaultSecurityGroupError, setDefaultSecurityGroup} from '@userActions/Domain';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {defaultSecurityGroupIDErrorsSelector, defaultSecurityGroupIDPendingActionSelector, defaultSecurityGroupIDSelector, domainNameSelector, selectGroupByID} from '@selectors/Domain';
import useConfirmModal from '@hooks/useConfirmModal';
import useThemeStyles from '@hooks/useThemeStyles';
import useLocalize from '@hooks/useLocalize';

type DefaultGroupToggleProps = {
    domainAccountID: number;
    groupID: string;
    groupName?: string;
};

function DefaultGroupToggle({domainAccountID, groupID, groupName}: DefaultGroupToggleProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: domainNameSelector,
    });
    const [defaultSecurityGroupID] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: defaultSecurityGroupIDSelector,
    });
    const [defaultSecurityGroup] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: selectGroupByID(defaultSecurityGroupID),
    });
    const [defaultSecurityGroupIDPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        canBeMissing: true,
        selector: defaultSecurityGroupIDPendingActionSelector(groupID),
    });
    const [defaultSecurityGroupIDErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {canBeMissing: true, selector: defaultSecurityGroupIDErrorsSelector(groupID)});

    const {showConfirmModal} = useConfirmModal();

    const onDefaultGroupToggle = async () => {
        if (!domainName || !defaultSecurityGroup?.name || !groupName) {
            return;
        }

        const result = await showConfirmModal({
            title: translate('domain.groups.defaultGroup'),
            prompt: translate('domain.groups.defaultGroupPrompt', defaultSecurityGroup.name, groupName),
            confirmText: translate('domain.groups.makeDefault'),
            cancelText: translate('domain.groups.nevermind'),
            shouldShowCancelButton: true,
        });

        if (result.action !== ModalActions.CONFIRM) {
            return;
        }

        setDefaultSecurityGroup(domainAccountID, groupID, domainName, defaultSecurityGroupID);
    };

    const isDefault = defaultSecurityGroupID === groupID;

    return (
        <ToggleSettingOptionRow
            title={translate('domain.groups.defaultGroup')}
            switchAccessibilityLabel={translate('domain.groups.defaultGroup')}
            isActive={isDefault}
            disabled={isDefault}
            onToggle={() => {
                onDefaultGroupToggle();
            }}
            wrapperStyle={[styles.mv3, styles.ph5]}
            errors={defaultSecurityGroupIDErrors}
            pendingAction={defaultSecurityGroupIDPendingAction}
            onCloseError={() => clearDefaultSecurityGroupError(domainAccountID, groupID)}
        />
    );
}

export default DefaultGroupToggle;
