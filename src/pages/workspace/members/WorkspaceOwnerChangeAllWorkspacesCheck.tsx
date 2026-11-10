/**
 * Asks a user taking over billing for a workspace whether to also take over the owner's other workspaces they're an admin on.
 */
import Button from '@components/Button';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {queueBulkTransferPolicyBillingOwner} from '@libs/actions/Policy/Member';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

type WorkspaceOwnerChangeAllWorkspacesCheckProps = {
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The owner's workspaces the user can take over billing for together, this one included */
    policyIDs: string[];

    /** Continues the transfer with this workspace only */
    onTakeOverThisWorkspace: () => void;
};

function WorkspaceOwnerChangeAllWorkspacesCheck({policy, policyIDs, onTakeOverThisWorkspace}: WorkspaceOwnerChangeAllWorkspacesCheckProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const takeOverAllWorkspaces = () => {
        if (!policy?.id) {
            return;
        }
        queueBulkTransferPolicyBillingOwner(policy.id, policyIDs);
    };

    return (
        <>
            <Text style={[styles.textHeadline, styles.mt3, styles.mb2]}>{translate('workspace.changeOwner.takeOverAllWorkspacesTitle')}</Text>
            <Text style={styles.flex1}>{translate('workspace.changeOwner.takeOverAllWorkspacesText', {ownerName: policy?.owner ?? '', count: policyIDs.length})}</Text>
            <View style={[styles.pb5, styles.gap3]}>
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    onPress={takeOverAllWorkspaces}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.OWNER_CHANGE.TAKE_OVER_ALL_WORKSPACES}
                >
                    <Button.Text>{translate('workspace.changeOwner.takeOverAllWorkspacesButtonText', {count: policyIDs.length})}</Button.Text>
                </Button>
                <Button
                    size={CONST.BUTTON_SIZE.LARGE}
                    onPress={onTakeOverThisWorkspace}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.OWNER_CHANGE.TAKE_OVER_THIS_WORKSPACE}
                >
                    <Button.Text>{translate('workspace.changeOwner.takeOverThisWorkspaceButtonText')}</Button.Text>
                </Button>
            </View>
        </>
    );
}

export default WorkspaceOwnerChangeAllWorkspacesCheck;
