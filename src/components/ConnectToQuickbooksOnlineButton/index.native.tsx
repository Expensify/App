import React, {useCallback, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {WebViewNavigation} from 'react-native-webview';
import {WebView} from 'react-native-webview';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Modal from '@components/Modal';
import useLocalize from '@hooks/useLocalize';
import {getQuickBooksOnlineSetupLink} from '@libs/actions/connections/QuickBooksOnline';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session} from '@src/types/onyx';
import type {ConnectToQuickbooksOnlineButtonProps} from './types';

type ConnectToQuickbooksOnlineButtonOnyxProps = {
    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;
};

const renderLoading = () => <FullScreenLoadingIndicator />;

function ConnectToQuickbooksOnlineButton({policyID, session}: ConnectToQuickbooksOnlineButtonProps & ConnectToQuickbooksOnlineButtonOnyxProps) {
    const [isWebViewOpen, setWebViewOpen] = useState(false);
    const [isQuickbooksOnlineReady, setIsQuickbooksOnlineReady] = useState(false);
    const {translate} = useLocalize();

    const handleNavigationStateChange = useCallback(({url, loading}: WebViewNavigation) => {
        if (loading || !url.startsWith('https://accounts.intuit.com/app/sign-in')) {
            return;
        }
        setIsQuickbooksOnlineReady(true);
    }, []);

    return (
        <>
            <Button
                onPress={() => setWebViewOpen(true)}
                text={translate('workspace.accounting.setup')}
                small
            />
            {isWebViewOpen && (
                <FullPageOfflineBlockingView>
                    <Modal
                        onClose={() => {
                            setWebViewOpen(false);
                            setIsQuickbooksOnlineReady(false);
                        }}
                        fullscreen
                        isVisible
                        type={CONST.MODAL.MODAL_TYPE.CENTERED}
                    >
                        {!isQuickbooksOnlineReady && <FullScreenLoadingIndicator />}
                        <WebView
                            source={{
                                uri: getQuickBooksOnlineSetupLink(policyID),
                                headers: {
                                    Cookie: `authToken=${session?.authToken}`,
                                },
                            }}
                            incognito // 'incognito' prop required for Android, issue here https://github.com/react-native-webview/react-native-webview/issues/1352
                            startInLoadingState={false}
                            renderLoading={renderLoading}
                            onNavigationStateChange={handleNavigationStateChange}
                        />
                    </Modal>
                </FullPageOfflineBlockingView>
            )}
        </>
    );
}

ConnectToQuickbooksOnlineButton.displayName = 'ConnectToQuickbooksOnlineButton';

export default withOnyx<ConnectToQuickbooksOnlineButtonProps & ConnectToQuickbooksOnlineButtonOnyxProps, ConnectToQuickbooksOnlineButtonOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(ConnectToQuickbooksOnlineButton);
