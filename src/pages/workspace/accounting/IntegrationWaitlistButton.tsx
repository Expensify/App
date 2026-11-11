/** Account-wide waitlist signup for an integration before its accounting connector is available. */
import Button from '@components/Button';
import Text from '@components/Text';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';

import type {WaitlistIntegration} from '@libs/IntegrationWaitlistUtils';

import {joinIntegrationWaitlist} from '@userActions/User';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect, useRef} from 'react';

import useIntegrationWaitlist from './useIntegrationWaitlist';

const SENTRY_LABELS = {
    [CONST.POLICY.CONNECTIONS.NAME.EXACT_ONLINE]: CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.EXACT_ONLINE_WAITLIST_BUTTON,
    [CONST.POLICY.CONNECTIONS.NAME.ODOO]: CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.ODOO_WAITLIST_BUTTON,
} satisfies Record<WaitlistIntegration, string>;

type IntegrationWaitlistButtonProps = {
    integration: WaitlistIntegration;
    policy: OnyxEntry<Policy>;
};

function IntegrationWaitlistButton({integration, policy}: IntegrationWaitlistButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const {canWrite, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.ACCOUNTING);
    const {signupTimestamp, pendingAction, errors} = useIntegrationWaitlist(integration);
    const isJoiningWaitlist = useRef(false);

    // Queued writes finish through Onyx, including retries after the press handler has returned.
    useEffect(() => {
        if (!isJoiningWaitlist.current || pendingAction) {
            return;
        }
        if (errors) {
            isJoiningWaitlist.current = false;
            return;
        }
        if (!signupTimestamp) {
            return;
        }

        isJoiningWaitlist.current = false;
        showConfirmModal({
            title: translate('workspace.accounting.integrationWaitlist.onWaitlist'),
            prompt: translate('workspace.accounting.integrationWaitlist.waitlistDescription'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    }, [errors, pendingAction, showConfirmModal, signupTimestamp, translate]);

    if (signupTimestamp && !pendingAction) {
        return <Text style={[styles.textSupporting, styles.flexShrink1, styles.textAlignRight]}>{translate('workspace.accounting.integrationWaitlist.onWaitlist')}</Text>;
    }

    const joinWaitlist = () => {
        if (isJoiningWaitlist.current || pendingAction) {
            return;
        }
        if (!canWrite) {
            showReadOnlyModal();
            return;
        }
        // Prevent repeated presses before the pending account state reaches this component.
        isJoiningWaitlist.current = true;
        joinIntegrationWaitlist(integration);
    };

    return (
        <Button
            onPress={joinWaitlist}
            isDisabled={!!pendingAction}
            isLoading={!!pendingAction}
            style={styles.justifyContentCenter}
            innerStyles={!canWrite ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined}
            hoverStyles={!canWrite ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined}
            size={CONST.BUTTON_SIZE.SMALL}
            sentryLabel={SENTRY_LABELS[integration]}
        >
            <Button.Text>{translate('workspace.accounting.integrationWaitlist.joinWaitlist')}</Button.Text>
        </Button>
    );
}

export default IntegrationWaitlistButton;
