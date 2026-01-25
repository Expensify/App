import React, {useState} from 'react';
import {View} from 'react-native';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';
import type {WalletStatementMessage, WalletStatementProps} from './types';
import handleWalletStatementNavigation from './walletNavigationUtils';

function WalletStatementModal({statementPageURL}: WalletStatementProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const styles = useThemeStyles();
    const [isLoading, setIsLoading] = useState(true);
    const authToken = session?.authToken ?? null;

    /**
     * Handles in-app navigation for iframe links
     */
    const navigate = (event: MessageEvent<WalletStatementMessage>) => {
        const {data} = event;
        const {type, url} = data || {};
        handleWalletStatementNavigation(type, url);
    };

    return (
        <>
            {isLoading && <FullScreenLoadingIndicator />}
            <View style={[styles.flex1]}>
                <iframe
                    src={`${statementPageURL}&authToken=${authToken}`}
                    title="Statements"
                    height="100%"
                    width="100%"
                    seamless
                    frameBorder="0"
                    onLoad={() => {
                        setIsLoading(false);

                        // We listen to a message sent from the iframe to the parent component when a link is clicked.
                        // This lets us handle navigation in the app, outside of the iframe.
                        window.onmessage = navigate;
                    }}
                />
            </View>
        </>
    );
}

export default WalletStatementModal;
