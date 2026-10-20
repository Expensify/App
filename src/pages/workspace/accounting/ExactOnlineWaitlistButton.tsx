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

import React, {useRef} from 'react';

type ExactOnlineWaitlistButtonProps = {
    policy: OnyxEntry<Policy>;
};

function ExactOnlineWaitlistButton({policy}: ExactOnlineWaitlistButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const {canWrite, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.ACCOUNTING);
    const [signupTimestamp, signupTimestampMetadata] = useOnyx(ONYXKEYS.NVP_EXACT_ONLINE_WAITLIST);
    const isJoiningWaitlist = useRef(false);

    if (signupTimestamp) {
        return <Text style={styles.textSupporting}>{translate('workspace.accounting.exactOnline.onWaitlist')}</Text>;
    }

    const joinWaitlist = () => {
        if (isJoiningWaitlist.current) {
            return;
        }
        if (!canWrite) {
            showReadOnlyModal();
            return;
        }
        // Prevent repeated presses before the optimistic account value reaches this component.
        isJoiningWaitlist.current = true;
        joinExactOnlineWaitlist();
        showConfirmModal({
            title: translate('workspace.accounting.exactOnline.onWaitlist'),
            prompt: translate('workspace.accounting.exactOnline.waitlistDescription'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        }).then(() => {
            isJoiningWaitlist.current = false;
        });
    };

    return (
        <Button
            onPress={joinWaitlist}
            isDisabled={signupTimestampMetadata.status === 'loading'}
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
