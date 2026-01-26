import isEmpty from 'lodash/isEmpty';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import ScrollView from '@components/ScrollView';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDisableTwoFactorAuthErrors} from '@libs/actions/Session';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import TwoFactorAuthForm from './TwoFactorAuthForm';
import type {BaseTwoFactorAuthFormRef} from './TwoFactorAuthForm/types';
import TwoFactorAuthWrapper from './TwoFactorAuthWrapper';

function DisablePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});

    const formRef = useRef<BaseTwoFactorAuthFormRef>(null);

    useEffect(() => {
        if (account?.requiresTwoFactorAuth) {
            return;
        }

        Navigation.navigate(ROUTES.SETTINGS_2FA_DISABLED, {forceReplace: true});
    }, [account?.requiresTwoFactorAuth]);

    const closeModal = () => {
        clearDisableTwoFactorAuthErrors();

        // Go back to the previous page because the user can't disable 2FA and this page is no longer relevant
        Navigation.goBack();
    };

    const {showConfirmModal} = useConfirmModal();
    const showTwoFactorAuthRequireModal = () => {
        return showConfirmModal({
            title: translate('twoFactorAuth.twoFactorAuthCannotDisable'),
            prompt: translate('twoFactorAuth.twoFactorAuthRequired'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

    useEffect(() => {
        if (isEmpty(account?.errorFields?.requiresTwoFactorAuth ?? {})) {
            return;
        }

        const handleTwoFactorAuthError = async () => {
            await showTwoFactorAuthRequireModal();
            closeModal();
        };

        handleTwoFactorAuthError();
    }, [account?.errorFields?.requiresTwoFactorAuth, showTwoFactorAuthRequireModal, closeModal]);

    return (
        <TwoFactorAuthWrapper
            stepName={CONST.TWO_FACTOR_AUTH_STEPS.DISABLE}
            title={translate('twoFactorAuth.disableTwoFactorAuth')}
        >
            <ScrollView
                contentContainerStyle={styles.flexGrow1}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[styles.mh5, styles.mb4, styles.mt3]}>
                    <TwoFactorAuthForm
                        innerRef={formRef}
                        validateInsteadOfDisable={false}
                    />
                </View>
            </ScrollView>
            <FixedFooter style={[styles.mt2, styles.pt2]}>
                <Button
                    success
                    large
                    text={translate('twoFactorAuth.disable')}
                    isLoading={account?.isLoading}
                    onPress={() => {
                        if (!formRef.current) {
                            return;
                        }
                        formRef.current.validateAndSubmitForm();
                    }}
                />
            </FixedFooter>
        </TwoFactorAuthWrapper>
    );
}

export default DisablePage;
