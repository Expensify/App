/** Account-wide signup for Exact Online before the accounting connector is available. */
import Button from '@components/Button';
import Text from '@components/Text';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';

import {joinExactOnlineWaitlist} from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect, useRef} from 'react';

type ExactOnlineWaitlistButtonProps = {
    policy: OnyxEntry<Policy>;
};

function ExactOnlineWaitlistButton({policy}: ExactOnlineWaitlistButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const {canWrite, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.ACCOUNTING);
    const [signupTimestamp, signupTimestampMetadata] = useOnyx(ONYXKEYS.NVP_EXACT_ONLINE_WAITLIST);
    const [pendingAction, pendingActionMetadata] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.pendingFields?.exactOnlineWaitlist});
    const [errors] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.errorFields?.exactOnlineWaitlist});
    const isJoiningWaitlist = useRef(false);

    // Queued writes finish through Onyx, including retries after the press handler has returned.
    useEffect(() => {
        if (!isJoiningWaitlist.current || pendingAction || pendingActionMetadata.status === 'loading') {
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
            title: translate('workspace.accounting.exactOnline.onWaitlist'),
            prompt: translate('workspace.accounting.exactOnline.waitlistDescription'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    }, [errors, pendingAction, pendingActionMetadata.status, showConfirmModal, signupTimestamp, translate]);

    if (signupTimestamp && !pendingAction) {
        return <Text style={[styles.textSupporting, styles.flexShrink1, styles.textAlignRight]}>{translate('workspace.accounting.exactOnline.onWaitlist')}</Text>;
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
        joinExactOnlineWaitlist();
    };

    return (
        <Button
            onPress={joinWaitlist}
            isDisabled={signupTimestampMetadata.status === 'loading' || pendingActionMetadata.status === 'loading' || !!pendingAction}
            isLoading={!!pendingAction}
            style={styles.justifyContentCenter}
            innerStyles={!canWrite ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined}
            hoverStyles={!canWrite ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined}
            size={CONST.BUTTON_SIZE.SMALL}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.EXACT_ONLINE_WAITLIST_BUTTON}
        >
            <Button.Text>{translate('workspace.accounting.exactOnline.joinWaitlist')}</Button.Text>
        </Button>
    );
}

export default ExactOnlineWaitlistButton;
