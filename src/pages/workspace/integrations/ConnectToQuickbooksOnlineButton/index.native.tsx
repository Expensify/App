import React, { useCallback, useRef, useState } from 'react';
import Text from '@components/Text';
// import type {WebViewNavigation} from 'react-native-webview';
import type { WebViewNavigation} from 'react-native-webview';
import {WebView} from 'react-native-webview';
// import useEnvironment from '@hooks/useEnvironment';
import Button from '@components/Button';
import { getQuickBooksOnlineSetupLink } from '@libs/actions/Integrations/QuickBooksOnline';
// import * as Link from '@userActions/Link';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import ONYXKEYS from '@src/ONYXKEYS';
import type { OnyxEntry} from 'react-native-onyx';
import { withOnyx } from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import type { Session } from '@src/types/onyx';
import Modal from '@components/Modal';


type ConnectToQuickbooksOnlineButtonOnyxProps = {
    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;
};
type ConnectToQuickbooksOnlineButtonProps = ConnectToQuickbooksOnlineButtonOnyxProps & {
    policyID: string;
};


const renderLoading = () => <FullScreenLoadingIndicator />;

function ConnectToQuickbooksOnlineButton({policyID, session}: ConnectToQuickbooksOnlineButtonProps) {
    const [isWebViewOpen, setWebViewOpen] = useState<boolean>(false);
    const [isQuickbooksOnlineReady, setIsQuickbooksOnlineReady] = useState<boolean>(false);
    const webViewRef = useRef<WebView>(null);
    const authToken = session?.authToken ?? null;

    const handleNavigationStateChange = useCallback(
        ({url, loading}: WebViewNavigation) => {
            if (loading || !url.startsWith('https://accounts.intuit.com/app/sign-in')) {
                return;
            }
            setIsQuickbooksOnlineReady(true);
        },
        [],
    );


    const url = getQuickBooksOnlineSetupLink(policyID);
    return (
        <>
            <Button
                onPress={() => setWebViewOpen(true)}
            >
                <Text>Setup</Text>
            </Button>
            {isWebViewOpen && <FullPageOfflineBlockingView>
                <Modal
                    onClose={() => {
                        setWebViewOpen(false);
                        setIsQuickbooksOnlineReady(false);
                    }}
                    fullscreen
                    isVisible
                    type='centered'
                >
                    {!isQuickbooksOnlineReady && <FullScreenLoadingIndicator/>}
                    <WebView
                        ref={webViewRef}
                        source={{
                            uri: url,
                            headers: {
                                Cookie: `authToken=${authToken}`,
                            },
                        }}
                        incognito // 'incognito' prop required for Android, issue here https://github.com/react-native-webview/react-native-webview/issues/1352
                        startInLoadingState={false}
                        renderLoading={renderLoading}
                        onNavigationStateChange={handleNavigationStateChange}
                    />
                </Modal>
            </FullPageOfflineBlockingView>}
        </>
    );
}

ConnectToQuickbooksOnlineButton.displayName = 'ConnectToQuickbooksOnlineButton';


export default withOnyx<ConnectToQuickbooksOnlineButtonProps, ConnectToQuickbooksOnlineButtonOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(ConnectToQuickbooksOnlineButton);