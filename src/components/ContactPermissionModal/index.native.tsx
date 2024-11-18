import React, {useEffect, useState} from 'react';
import {Linking} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import ConfirmModal from '@components/ConfirmModal';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getContactPermission, requestContactPermission} from '@pages/iou/request/ContactPermission';
import type {ContactPermissionModalProps} from './types';

function ContactPermissionModal({startPermissionFlow, resetPermissionFlow, onDeny, onGrant}: ContactPermissionModalProps) {
    const [showModal, setShowModal] = useState(false);

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    useEffect(() => {
        if (!startPermissionFlow) {
            return;
        }
        getContactPermission().then((status) => {
            if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
                return onGrant();
            }
            if (status === RESULTS.BLOCKED) {
                return;
            }
            setShowModal(true);
        });
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- We only want to run this effect when startPermissionFlow changes
    }, [startPermissionFlow]);

    const goToSettingsPermission = () => {
        Linking.openSettings();
        setShowModal(false);
    };

    const grantLocationPermission = () => {
        requestContactPermission().then((status) => {
            if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
                onGrant();
            } else if (status === RESULTS.BLOCKED) {
                return;
            } else {
                onDeny(status);
                goToSettingsPermission();
                resetPermissionFlow();
            }
            setShowModal(false);
        });
    };

    const skipLocationPermission = () => {
        onDeny(RESULTS.DENIED);
        setShowModal(false);
    };

    const closeModal = () => {
        setShowModal(false);
        resetPermissionFlow();
    };

    return (
        <ConfirmModal
            isVisible={showModal}
            onConfirm={grantLocationPermission}
            onCancel={skipLocationPermission}
            onBackdropPress={closeModal}
            confirmText={translate('common.continue')}
            cancelText={translate('common.notNow')}
            prompt={translate('contact.importContactsText')}
            promptStyles={[styles.textLabelSupportingEmptyValue, styles.mb4]}
            title={translate('contact.importContactsTitle')}
            titleContainerStyles={[styles.mt2, styles.mb0]}
            titleStyles={[styles.textHeadline]}
            iconSource={Illustrations.ToddWithPhones}
            iconFill={false}
            iconWidth={176}
            iconHeight={178}
            shouldCenterIcon
            shouldReverseStackedButtons
        />
    );
}

ContactPermissionModal.displayName = 'ContactPermissionModal';

export default ContactPermissionModal;
