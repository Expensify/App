import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import type {PlaidLinkOnSuccessMetadata} from 'react-plaid-link';
import {usePlaidLink} from 'react-plaid-link';
import ActivityIndicator from '@components/ActivityIndicator';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobileSafari, isSafari} from '@libs/Browser';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type PlaidLinkProps from './types';

// Helper to remove the state added by Plaid on Safari after the Plaid flow ends.
// We need to manually clear it because Plaid doesn't remove it on its own after exiting on Safari,
// which may cause the navigation state to reload when a Modal with the `shouldHandleNavigationBack` prop is used immediately afterward.
function clearSafariHistoryState() {
    const isSafariBrowser = isSafari() || isMobileSafari();
    if (window.history.state === null && isSafariBrowser) {
        window.history.back();
    }
}

function PlaidLink({token, onSuccess = () => {}, onError = () => {}, onExit = () => {}, onEvent, receivedRedirectURI}: PlaidLinkProps) {
    const [isPlaidLoaded, setIsPlaidLoaded] = useState(false);
    const styles = useThemeStyles();
    const successCallback = useCallback(
        (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
            clearSafariHistoryState();
            onSuccess({publicToken, metadata});
        },
        [onSuccess],
    );

    const {open, ready, error} = usePlaidLink({
        token,
        onSuccess: successCallback,
        onExit: (exitError, metadata) => {
            Log.info('[PlaidLink] Exit: ', false, {exitError, metadata});
            clearSafariHistoryState();
            onExit();
        },
        onEvent: (event, metadata) => {
            Log.info('[PlaidLink] Event: ', false, {event, metadata});
            onEvent(event, metadata);
        },
        onLoad: () => setIsPlaidLoaded(true),

        // The redirect URI with an OAuth state ID. Needed to re-initialize the PlaidLink after directing the
        // user to their respective bank platform
        receivedRedirectUri: receivedRedirectURI,
    });

    useEffect(() => {
        if (error) {
            onError(error);
            return;
        }

        if (!ready) {
            return;
        }

        if (!isPlaidLoaded) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        open();
    }, [ready, error, isPlaidLoaded, open, onError]);

    return (
        <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
            <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
        </View>
    );
}

export default PlaidLink;
