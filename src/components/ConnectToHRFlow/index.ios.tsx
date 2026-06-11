import {openAuthSessionAsync} from 'expo-web-browser';
import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {getShortLivedAuthTokenURL} from '@userActions/Link';
import CONST from '@src/CONST';
import type ConnectToHRFlowProps from './types';

function ConnectToHRFlow({setupLink, onDone}: ConnectToHRFlowProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const hasOpened = useRef(false);
    const isDismissed = useRef(false);
    const isMounted = useRef(true);
    const [isModalOpen, setIsModalOpen] = useState(true);

    const dismiss = () => {
        if (isDismissed.current || !isMounted.current) {
            return;
        }
        isDismissed.current = true;
        setIsModalOpen(false);
    };

    const openSession = () => {
        if (hasOpened.current) {
            return;
        }
        hasOpened.current = true;

        getShortLivedAuthTokenURL(setupLink)
            // CONST.DEEPLINK_BASE_URL is used as a sentinel so ASWebAuthenticationSession
            // auto-dismisses when the flow redirects back to the app via deep link.
            .then((url) => {
                if (isDismissed.current) {
                    return;
                }
                return openAuthSessionAsync(url, CONST.DEEPLINK_BASE_URL, {preferEphemeralSession: true});
            })
            .finally(dismiss);
    };

    const {isOffline} = useNetwork({onReconnect: openSession});

    useEffect(() => {
        if (isOffline) {
            return;
        }
        openSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only the initial setupLink should be used; re-opening the auth session on prop change is not desired
    }, []);

    useEffect(
        () => () => {
            isMounted.current = false;
        },
        [],
    );

    return (
        <Modal
            onClose={dismiss}
            onModalHide={onDone}
            fullscreen
            isVisible={isModalOpen}
            type={CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
        >
            <HeaderWithBackButton
                title={translate('workspace.common.hr')}
                onBackButtonPress={dismiss}
            />
            <FullPageOfflineBlockingView>
                <View style={[StyleSheet.absoluteFill, styles.fullScreenLoading]}>
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        reasonAttributes={{context: 'ConnectToHRFlow'}}
                    />
                </View>
            </FullPageOfflineBlockingView>
        </Modal>
    );
}

export default ConnectToHRFlow;
