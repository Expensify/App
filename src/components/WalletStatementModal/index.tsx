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

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});
    /**
     * Handles in-app navigation for iframe links
     */
    const navigate = (event: MessageEvent<WalletStatementMessage>) => {
        const {data} = event;
        const {type, url} = data || {};
        handleWalletStatementNavigation(conciergeReportID, type, url);
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
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
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
