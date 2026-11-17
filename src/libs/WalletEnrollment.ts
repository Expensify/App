/** Keeps a wallet setup attempt alive only while its personal-details flow is open. */
import type {NavigationState, PartialState} from '@react-navigation/native';

import Navigation, {navigationRef} from './Navigation/Navigation';
import {rand64} from './NumberUtils';

type WalletEnrollmentAttempt = {
    id: string;
    cardID: string;
    resume: () => void;
    unsubscribe: () => void;
    isCompleting: boolean;
};

let pendingAttempt: WalletEnrollmentAttempt | undefined;

function hasEnrollmentRoute(state: NavigationState | PartialState<NavigationState> | undefined, id: string, routeKey?: string): boolean {
    return (
        state?.routes.some(
            (route) =>
                (route.params && 'walletEnrollmentID' in route.params && route.params.walletEnrollmentID === id && (!routeKey || route.key === routeKey)) ||
                hasEnrollmentRoute(route.state, id, routeKey),
        ) ?? false
    );
}

function cancelWalletEnrollment(id: string | undefined) {
    if (!id || pendingAttempt?.id !== id) {
        return;
    }
    pendingAttempt.unsubscribe();
    pendingAttempt = undefined;
}

function beginWalletEnrollment(cardID: string, resume: () => void): string {
    cancelWalletEnrollment(pendingAttempt?.id);
    const id = rand64();
    let hasOpened = false;
    const unsubscribe = navigationRef.addListener('state', () => {
        // Inspect the root rather than the emitting child navigator, which changes during internal replacements.
        if (hasEnrollmentRoute(navigationRef.getRootState(), id)) {
            hasOpened = true;
        } else if (hasOpened) {
            cancelWalletEnrollment(id);
        }
    });
    pendingAttempt = {id, cardID, resume, unsubscribe, isCompleting: false};
    return id;
}

function isWalletEnrollmentActive(id: string, cardID: string, routeKey?: string): boolean {
    return pendingAttempt?.id === id && pendingAttempt.cardID === cardID && !pendingAttempt.isCompleting && hasEnrollmentRoute(navigationRef.getRootState(), id, routeKey);
}

function completeWalletEnrollment(id: string, cardID: string, verificationKey: string): boolean {
    // Returning to edit replaces verification. Its old save must not submit a newer draft or close a later verification screen.
    if (!isWalletEnrollmentActive(id, cardID, verificationKey) || !pendingAttempt) {
        return false;
    }
    // Closing after a successful save is not a cancellation. The button still owns cancellation on unmount.
    pendingAttempt.isCompleting = true;
    pendingAttempt.unsubscribe();
    Navigation.closeRHPFlow();
    Navigation.runAfterUpcomingTransition(() => {
        if (pendingAttempt?.id !== id) {
            return;
        }
        const {resume} = pendingAttempt;
        pendingAttempt = undefined;
        resume();
    });
    return true;
}

export {beginWalletEnrollment, cancelWalletEnrollment, completeWalletEnrollment, isWalletEnrollmentActive};
