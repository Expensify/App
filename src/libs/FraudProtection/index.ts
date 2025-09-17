import {Str} from 'expensify-common';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {init, sendEvent, setAttribute, setAuthenticationData} from './GroupIBSdkBridge';

let sessionID: string;
let identity: string | undefined;
// We use `connectWithoutView` here since this connection only sends the new session data to the Fraud Protection backend, and doesn't need to trigger component re-renders.
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        const isAuthenticated = !!(session?.authToken ?? null);
        const newIdentity = isAuthenticated ? (session?.accountID?.toString() ?? '') : '';
        if (newIdentity !== identity) {
            identity = newIdentity;
            sessionID = typeof identity === 'string' && identity.length > 0 ? Str.guid() : '';
            setAuthenticationData(identity, sessionID);
        }
    },
});

// We use `connectWithoutView` here since this connection only sends the new email and mfa data to the Fraud Protection backend, and doesn't need to trigger component re-renders.
Onyx.connectWithoutView({
    key: ONYXKEYS.ACCOUNT,
    callback: (account) => {
        setAttribute('email', account?.primaryLogin ?? '');
        setAttribute('mfa', account?.requiresTwoFactorAuth ? '2fa_enabled' : '2fa_disabled');
    },
});

const EVENTS = {
    START_SUPPORT_SESSION: 'StartSupportSession',
    STOP_SUPPORT_SESSION: 'StopSupportSession',
    START_COPILOT_SESSION: 'StartCopilotSession',
    STOP_COPILOT_SESSION: 'StopCopilotSession',
    ISSUE_EXPENSIFY_CARD: 'IssueExpensifyCard',
    EDIT_EXPENSIFY_CARD_LIMIT: 'EditExpensifyCardLimit',
    ISSUE_ADMIN_ISSUED_VIRTUAL_CARD: 'IssueAdminIssuedVirtualCard',
    EDIT_LIMIT_ADMIN_ISSUE_VIRTUAL_CARD: 'EditLimitAdminIssueVirtualCard',
    REQUEST_NEW_PHYSICAL_EXPENSIFY_CARD: 'RequestNewPhysicalExpensifyCard',
    REQUEST_NEW_VIRTUAL_EXPENSIFY_CARD: 'RequestNewVirtualExpensifyCard',
    MERGE_ACCOUNT: 'MergeAccount',
    TOGGLE_TWO_FACTOR_AUTH: 'ToggleTwoFactorAuth',
    ADD_SECONDARY_LOGIN: 'AddSecondaryLogin',
};

export default {init, sendEvent};
export {EVENTS};
