import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {WebView} from 'react-native-webview';
import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import RequireTwoFactorAuthenticationModal from '@components/RequireTwoFactorAuthenticationModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getXeroSetupLink} from '@libs/actions/connections/Xero';
import {close} from '@libs/actions/Modal';
import getUAForWebView from '@libs/getUAForWebView';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ConnectToXeroFlowProps} from './types';

function ConnectToXeroFlow({policyID}: ConnectToXeroFlowProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const webViewRef = useRef<WebView>(null);
    const [isWebViewOpen, setIsWebViewOpen] = useState(false);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const authToken = session?.authToken ?? null;

    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const isUserValidated = account?.validated;
    const is2FAEnabled = account?.requiresTwoFactorAuth ?? false;

    const renderLoading = () => (
        <View style={[StyleSheet.absoluteFill, styles.fullScreenLoading]}>
            <ActivityIndicator
                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                reasonAttributes={{context: 'ConnectToXeroFlow'}}
            />
        </View>
    );
    const [isRequire2FAModalOpen, setIsRequire2FAModalOpen] = useState(false);

    useEffect(() => {
        if (!is2FAEnabled) {
            setIsRequire2FAModalOpen(true);
            return;
        }
        setIsWebViewOpen(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            {!is2FAEnabled && (
                <RequireTwoFactorAuthenticationModal
                    onSubmit={() => {
                        setIsRequire2FAModalOpen(false);
                        close(() => {
                            const backTo = ROUTES.POLICY_ACCOUNTING.getRoute(policyID);
                            const validatedUserForwardTo = getXeroSetupLink(policyID);
                            if (isUserValidated) {
                                Navigation.navigate(ROUTES.SETTINGS_2FA_ROOT.getRoute(backTo, validatedUserForwardTo));
                                return;
                            }
                            Navigation.navigate(
                                ROUTES.SETTINGS_2FA_VERIFY_ACCOUNT.getRoute({
                                    backTo,
                                    forwardTo: ROUTES.SETTINGS_2FA_ROOT.getRoute(backTo, validatedUserForwardTo),
                                }),
                            );
                        });
                    }}
                    onCancel={() => setIsRequire2FAModalOpen(false)}
                    isVisible={isRequire2FAModalOpen}
                    description={translate('twoFactorAuth.twoFactorAuthIsRequiredDescription')}
                />
            )}
            <Modal
                onClose={() => setIsWebViewOpen(false)}
                fullscreen
                isVisible={isWebViewOpen}
                type={CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
            >
                <HeaderWithBackButton
                    title={translate('workspace.accounting.title')}
                    onBackButtonPress={() => setIsWebViewOpen(false)}
                    shouldDisplayHelpButton={false}
                />
                <FullPageOfflineBlockingView>
                    <WebView
                        ref={webViewRef}
                        source={{
                            uri: getXeroSetupLink(policyID),
                            headers: {
                                Cookie: `authToken=${authToken}`,
                            },
                        }}
                        userAgent={getUAForWebView()}
                        incognito
                        startInLoadingState
                        renderLoading={renderLoading}
                    />
                </FullPageOfflineBlockingView>
            </Modal>
        </>
    );
}

export default ConnectToXeroFlow;
