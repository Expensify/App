import React, {useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import {WebView} from 'react-native-webview';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const {translate} = useLocalize();

    return (
        <>
            <Button
                onPress={() => setIsModalOpen(true)}
                text={translate('workspace.accounting.setup')}
            />
            <Modal
                fullscreen
                onClose={() => setIsModalOpen(false)}
                isVisible={isModalOpen}
                type={CONST.MODAL.MODAL_TYPE.CENTERED}
            >
                <HeaderWithBackButton
                    title={translate('workspace.accounting.title')}
                    onBackButtonPress={() => setIsModalOpen(false)}
                />
                <FullPageOfflineBlockingView>
                    <WebView
                        source={{
                            uri: getQuickBooksOnlineSetupLink(policyID),
                            headers: {
                                Cookie: `authToken=${session?.authToken}`,
                            },
                        }}
                        incognito // 'incognito' prop required for Android, issue here https://github.com/react-native-webview/react-native-webview/issues/1352
                        startInLoadingState
                        renderLoading={renderLoading}
                    />
                </FullPageOfflineBlockingView>
            </Modal>
        </>
    );
}

ConnectToQuickbooksOnlineButton.displayName = 'ConnectToQuickbooksOnlineButton';

export default withOnyx<ConnectToQuickbooksOnlineButtonProps & ConnectToQuickbooksOnlineButtonOnyxProps, ConnectToQuickbooksOnlineButtonOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(ConnectToQuickbooksOnlineButton);
