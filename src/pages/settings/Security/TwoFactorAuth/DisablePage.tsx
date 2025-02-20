import isEmpty from 'lodash/isEmpty';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import FixedFooter from '@components/FixedFooter';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
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
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

    const formRef = useRef<BaseTwoFactorAuthFormRef>(null);

    useEffect(() => {
        if (account?.requiresTwoFactorAuth) {
            return;
        }

        Navigation.navigate(ROUTES.SETTINGS_2FA_DISABLED);
    }, [account?.requiresTwoFactorAuth]);

    const closeModal = useCallback(() => {
        clearDisableTwoFactorAuthErrors();
        Navigation.goBack();
    }, []);

    return (
        <TwoFactorAuthWrapper
            stepName={CONST.TWO_FACTOR_AUTH_STEPS.DISABLE}
            title={translate('twoFactorAuth.disableTwoFactorAuth')}
        >
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <View style={[styles.ph5, styles.mt3]}>
                    <Text>{translate('twoFactorAuth.explainProcessToRemove')}</Text>
                </View>
            </ScrollView>
            <FixedFooter style={[styles.mt2, styles.pt2]}>
                <View style={[styles.mh5, styles.mb4]}>
                    <TwoFactorAuthForm
                        innerRef={formRef}
                        validateInsteadOfDisable={false}
                    />
                </View>
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
            <ConfirmModal
                title={translate('twoFactorAuth.twoFactorAuthCannotDisable')}
                prompt={translate('twoFactorAuth.twoFactorAuthRequired')}
                confirmText={translate('common.buttonConfirm')}
                onConfirm={closeModal}
                shouldShowCancelButton={false}
                onBackdropPress={closeModal}
                onCancel={closeModal}
                isVisible={!isEmpty(account?.errorFields?.disableTwoFactorAuth ?? {})}
            />
        </TwoFactorAuthWrapper>
    );
}

DisablePage.displayName = 'DisablePage';

export default DisablePage;
