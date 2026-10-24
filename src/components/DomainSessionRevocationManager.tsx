/** Restores domain revocation progress independently of authenticated navigation. */
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearRevokedDomainSession, dismissDomainSessionRevocation, getDomainSessionRevocationStatus, updateDomainSessionRevocationStatus} from '@libs/actions/Domain';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {isModalActiveSelector} from '@selectors/Modal';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

import ActivityIndicator from './ActivityIndicator';
import Button from './Button';
import Modal from './Modal';
import Text from './Text';

function DomainSessionRevocationManager() {
    const [receipt] = useOnyx(ONYXKEYS.DOMAIN_SESSION_REVOCATION);
    const [isAnotherModalActive] = useOnyx(ONYXKEYS.MODAL, {selector: isModalActiveSelector});
    const [isVisible, setIsVisible] = useState(false);
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const completionHandle = receipt?.completionHandle;
    const status = receipt?.status;

    // Let the confirmation finish closing before opening another native modal.
    if (receipt && !isVisible && !isAnotherModalActive) {
        setIsVisible(true);
    }
    if (!receipt && isVisible) {
        setIsVisible(false);
    }

    useEffect(() => {
        if (!completionHandle || status !== 'running' || isOffline) {
            return;
        }
        let isActive = true;
        let timeout: ReturnType<typeof setTimeout> | undefined;
        const poll = async () => {
            const nextStatus = await getDomainSessionRevocationStatus(completionHandle);
            if (!isActive) {
                return;
            }
            await updateDomainSessionRevocationStatus(completionHandle, nextStatus);
            if (isActive && nextStatus === 'running') {
                timeout = setTimeout(() => {
                    poll();
                }, CONST.DOMAIN.SESSION_REVOCATION_POLL_INTERVAL_MS);
            }
        };
        poll();
        return () => {
            isActive = false;
            clearTimeout(timeout);
        };
    }, [completionHandle, status, isOffline]);

    useEffect(() => {
        if (status !== 'succeeded') {
            return;
        }
        // A reload between saving success and clearing credentials must finish local sign-out.
        clearRevokedDomainSession();
    }, [status]);

    if (!receipt || !isVisible) {
        return null;
    }

    // This modal survives sign-out and cannot register history on the authenticated navigator.
    return (
        <Modal
            isVisible
            type={CONST.MODAL.MODAL_TYPE.CONFIRM}
            onClose={() => {}}
            onBackdropPress={() => {}}
            shouldHandleNavigationBack={false}
            shouldTreatModalAsCovering
        >
            <View style={styles.m5}>
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.mb2]}>
                    <Text style={[styles.exportDownloadTitle, styles.flexShrink1]}>{translate(`domain.members.sessionRevocation.${receipt.status}Title`)}</Text>
                    {status === 'running' && <ActivityIndicator size="small" />}
                </View>
                <Text style={styles.mb5}>{translate(`domain.members.sessionRevocation.${receipt.status}Body`)}</Text>
                {isOffline && <Text style={styles.mb5}>{translate('common.thisFeatureRequiresInternet')}</Text>}
                {status === 'unavailable' && (
                    <Button
                        onPress={() => updateDomainSessionRevocationStatus(receipt.completionHandle, 'running')}
                        isDisabled={isOffline}
                        style={[styles.w100, styles.mb3]}
                    >
                        <Button.Text>{translate('domain.members.sessionRevocation.checkStatus')}</Button.Text>
                    </Button>
                )}
                {status !== 'running' && (
                    <Button
                        onPress={dismissDomainSessionRevocation}
                        style={styles.w100}
                    >
                        <Button.Text>{translate(status === 'succeeded' ? 'domain.members.sessionRevocation.returnToSignIn' : 'common.close')}</Button.Text>
                    </Button>
                )}
            </View>
        </Modal>
    );
}

export default DomainSessionRevocationManager;
