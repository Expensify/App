import React, {useState} from 'react';
import {Button, Modal} from 'react-native';
import WebView from 'react-native-webview';
import {useSession} from '@components/OnyxProvider';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import {getQuickBooksOnlineSetupLink} from '@libs/actions/connections/QuickBooksOnline';
import type {ConnectToQuickbooksOnlineButtonProps} from './types';

function ConnectToQuickbooksOnlineButton({policyID}: ConnectToQuickbooksOnlineButtonProps) {
    const [isWebViewOpen, setWebViewOpen] = useState<boolean>(false);
    const session = useSession();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();

    return (
        <>
            <Button
                onPress={() => setWebViewOpen(true)}
                title={translate('workspace.accounting.setup')}
            />
            <Modal
                onDismiss={() => setWebViewOpen(false)}
                presentationStyle="fullScreen"
                visible={isWebViewOpen}
            >
                <WebView
                    source={{
                        uri: `${environmentURL}${getQuickBooksOnlineSetupLink(policyID)}`,
                        headers: {
                            Cookie: `authToken=${session.authToken}`,
                        },
                    }}
                    incognito
                    startInLoadingState={false}
                />
            </Modal>
        </>
    );
}

export default ConnectToQuickbooksOnlineButton;
