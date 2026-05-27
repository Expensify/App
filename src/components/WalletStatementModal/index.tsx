import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {WalletStatementMessage, WalletStatementProps} from './types';
import handleWalletStatementNavigation from './walletNavigationUtils';

function WalletStatementModal({statementPageURL}: WalletStatementProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const styles = useThemeStyles();
    const [isLoading, setIsLoading] = useState(true);
    const authToken = session?.authToken ?? null;

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const navigateRef = useRef<(event: MessageEvent<WalletStatementMessage>) => void>(null);

    /**
     * Handles in-app navigation for iframe links
     */
    const navigate = useCallback(
        (event: MessageEvent<WalletStatementMessage>) => {
            const {data} = event;
            const {type, url} = data || {};
            handleWalletStatementNavigation(conciergeReportID, introSelected, session?.accountID, isSelfTourViewed, betas, type, url);
        },
        [conciergeReportID, introSelected, session?.accountID, isSelfTourViewed, betas],
    );

    useEffect(() => {
        navigateRef.current = navigate;
    }, [navigate]);

    return (
        <View style={styles.flex1}>
            {isLoading && (
                <View style={[StyleSheet.absoluteFill, styles.fullScreenLoading]}>
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        reasonAttributes={{context: 'WalletStatementModal'}}
                    />
                </View>
            )}
            <iframe
                src={`${statementPageURL}&authToken=${authToken}`}
                title="Statements"
                height="100%"
                width="100%"
                seamless
                // frameBorder is deprecated in HTML5 but needed for consistent cross-browser iframe border removal
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                frameBorder="0"
                onLoad={() => {
                    setIsLoading(false);

                    // We listen to a message sent from the iframe to the parent component when a link is clicked.
                    // This lets us handle navigation in the app, outside of the iframe.
                    window.onmessage = (event: MessageEvent<WalletStatementMessage>) => navigateRef.current?.(event);
                }}
            />
        </View>
    );
}

export default WalletStatementModal;
