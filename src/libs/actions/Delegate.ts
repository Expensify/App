import * as API from '@libs/API';
import type {
    AddDelegateParams as APIAddDelegateParams,
    RemoveDelegateParams as APIRemoveDelegateParams,
    RemoveDelegatorParams as APIRemoveDelegatorParams,
    UpdateDelegateRoleParams as APIUpdateDelegateRoleParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import Log from '@libs/Log';
import {clearPreservedSearchNavigatorStates} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import * as NetworkStore from '@libs/Network/NetworkStore';
import * as SequentialQueue from '@libs/Network/SequentialQueue';
import Pusher from '@libs/Pusher';
import {requestPusherReinitialize} from '@libs/requestPusherReinitialize';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Delegate, DelegatedAccess, DelegateRole} from '@src/types/onyx/Account';
import type Credentials from '@src/types/onyx/Credentials';
import type Session from '@src/types/onyx/Session';

import type {OnyxEntry, OnyxMultiSetInput, OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import HybridAppModule from '@expensify/react-native-hybrid-app';
import Onyx from 'react-native-onyx';

import {openApp} from './App';
import clearOnyxAndSeedFullReconnect from './clearOnyxAndSeedFullReconnect';
import updateSessionAuthTokens from './Session/updateSessionAuthTokens';

const KEYS_TO_PRESERVE_DELEGATE_ACCESS = [
    ONYXKEYS.NVP_TRY_FOCUS_MODE,
    ONYXKEYS.PREFERRED_THEME,
    ONYXKEYS.NVP_PREFERRED_LOCALE,
    ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING,
    ONYXKEYS.SESSION,
    ONYXKEYS.STASHED_SESSION,
    ONYXKEYS.HAS_LOADED_APP,
    ONYXKEYS.STASHED_CREDENTIALS,
    ONYXKEYS.PENDING_SELF_COPILOT_REMOVAL,
    ONYXKEYS.HYBRID_APP,

    // Otherwise it's wiped and refetched by OpenApp, letting the product-marketing window flash back in
    // before the dismissal value round-trips back from the server.
    ONYXKEYS.NVP_LAST_DISMISSED_MARKETING_WINDOW,

    // We need to preserve the sidebar loaded state since we never unmount the sidebar when connecting as a delegate
    // This allows the report screen to load correctly when the delegate token expires and the delegate is returned to their original account.
    ONYXKEYS.RAM_ONLY_IS_SIDEBAR_LOADED,
    ONYXKEYS.NETWORK,
    ONYXKEYS.ACTIVE_SERVER,
    ONYXKEYS.IS_DEBUG_MODE_ENABLED,
    ONYXKEYS.BETA_OVERRIDES,
    ONYXKEYS.COLLECTION.PASSKEY_CREDENTIALS,
    ONYXKEYS.COLLECTION.DEVICE_BIOMETRICS,

    // Keep personal details through the switch so the nav avatar and user names render
    // instantly instead of showing a skeleton while OpenApp responds. OpenApp overwrites
    // this key with fresh data when its response lands, so stale entries are short lived.
    ONYXKEYS.PERSONAL_DETAILS_LIST,
];

/** Atomically reset Onyx for a delegate-access transition. `extraSeeds` are written in the same step as the clear. */
function clearOnyxForDelegateTransition(extraSeeds?: OnyxMultiSetInput): Promise<void> {
    return clearOnyxAndSeedFullReconnect(KEYS_TO_PRESERVE_DELEGATE_ACCESS, extraSeeds);
}

type LoadAccountAfterDelegateTransitionParams = {
    /** Account to reinitialize Pusher for */
    accountID: number | undefined;

    /** Email to reinitialize Pusher for */
    email: string | undefined;

    /** Account to switch OldDot to, omitted to leave OldDot as is */
    hybridAppAccount?: Parameters<typeof HybridAppModule.switchAccount>[0];
};

/**
 * Loads the account after a delegate-access transition and syncs OldDot to it. Pusher is not awaited: on Android it can
 * stall right after the transition's disconnect, which would block the switch. See Expensify/App#93458.
 */
function loadAccountAfterDelegateTransition({accountID, email, hybridAppAccount}: LoadAccountAfterDelegateTransitionParams): Promise<void> {
    return openApp().then(() => {
        requestPusherReinitialize({accountID, email}).catch((error: unknown) => {
            Log.hmmm('[Delegate] Failed to reinitialize Pusher after a delegate-access transition', {error: ErrorUtils.getErrorMessage(error)});
        });

        if (!CONFIG.IS_HYBRID_APP || !hybridAppAccount) {
            return;
        }
        HybridAppModule.switchAccount(hybridAppAccount);
    });
}

type WithDelegatedAccess = {
    // Optional keeps call sites clean, but still encourages passing `account?.delegatedAccess`.
    delegatedAccess: DelegatedAccess | undefined;
};

type WithCredentials = {
    credentials: Credentials | undefined;
};

type WithEmail = {
    email: string;
};

type WithRole = {
    role: DelegateRole;
};

type WithValidateCode = {
    validateCode: string;
};

type WithFieldName = {
    // Constrain to known keys to avoid misspells at call sites
    fieldName: 'addDelegate' | 'updateDelegateRole' | 'connect' | 'removeDelegator' | 'removeDelegate';
};

type WithStashedCredentials = {
    stashedCredentials: Credentials | undefined;
};

type WithSession = {
    session: Session | undefined;
};

type WithStashedSession = {
    stashedSession: Session | undefined;
};

type WithActivePolicyID = {
    activePolicyID: OnyxEntry<string>;
};

type DisconnectParams = WithStashedCredentials & WithStashedSession;

const DISCONNECT_RESULT = {
    /** Session ended, original session restored with fresh tokens */
    RESTORED: 'restored',

    /** Incomplete response, original session restored from the stash */
    RESTORED_FROM_STASH: 'restoredFromStash',

    /** Session ended but the restore threw partway. SESSION is written first, so it is most likely restored. */
    RESTORE_INTERRUPTED: 'restoreInterrupted',

    /** Request failed, copilot session still active */
    FAILED: 'failed',
} as const;

type DisconnectResult = ValueOf<typeof DISCONNECT_RESULT>;

// Clear delegator-level errors
type ClearDelegatorErrorsParams = WithDelegatedAccess;

// Add a delegate (requires code)
type AddDelegateParams = WithEmail & WithRole & WithValidateCode & WithDelegatedAccess;

// Remove a delegate
type RemoveDelegateParams = WithEmail & WithDelegatedAccess;

// Clear delegate errors scoped by field
type ClearDelegateErrorsByFieldParams = WithEmail & WithFieldName & WithDelegatedAccess;

// Update existing delegate role (requires code)
type UpdateDelegateRoleParams = WithEmail & WithRole & WithValidateCode & WithDelegatedAccess;

// Is connected as delegate?
type IsConnectedAsDelegateParams = WithDelegatedAccess;

// Connect as delegate
type ConnectParams = WithEmail & WithDelegatedAccess & WithCredentials & WithSession & WithActivePolicyID;

/**
 * Connects the user as a delegate to another account.
 * Returns a Promise that resolves to true on success, false on failure, or undefined if not applicable.
 */
function connect({email, delegatedAccess, credentials, session, activePolicyID}: ConnectParams) {
    if (isConnectedAsDelegate({delegatedAccess})) {
        Log.info('[Delegate] Already connected as a delegate, skipping connect');
        return;
    }

    Onyx.set(ONYXKEYS.STASHED_CREDENTIALS, credentials ?? {});
    Onyx.set(ONYXKEYS.STASHED_SESSION, session ?? {});

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT | typeof ONYXKEYS.IS_SWITCHING_TO_DELEGATOR>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: {
                        connect: {
                            [email]: null,
                        },
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.IS_SWITCHING_TO_DELEGATOR,
            value: true,
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: {
                        connect: {
                            [email]: null,
                        },
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT | typeof ONYXKEYS.IS_SWITCHING_TO_DELEGATOR>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: {
                        connect: {
                            [email]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('delegate.genericError'),
                        },
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.IS_SWITCHING_TO_DELEGATOR,
            value: false,
        },
    ];

    // We need to access the authToken directly from the response to update the session
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.CONNECT_AS_DELEGATE, {to: email}, {optimisticData, successData, failureData})
        .then((response) => {
            if (!response?.restrictedToken || !response?.encryptedAuthToken) {
                Log.alert('[Delegate] No auth token returned while connecting as a delegate');
                Onyx.update(failureData);
                return;
            }
            if (!activePolicyID && CONFIG.IS_HYBRID_APP) {
                Log.alert('[Delegate] Unable to access activePolicyID');
                Onyx.update(failureData);
                return;
            }
            clearPreservedSearchNavigatorStates();
            const restrictedToken = response.restrictedToken;
            const policyID = activePolicyID;

            return SequentialQueue.waitForIdle()
                .then(() => {
                    // Update authToken in Onyx so it persists if the further flow does not complete for any reason.
                    return updateSessionAuthTokens(response?.restrictedToken, response?.encryptedAuthToken, CONST.AUTH_TOKEN_TYPES.DELEGATE);
                })
                .then(() => {
                    NetworkStore.setAuthToken(response?.restrictedToken ?? null);
                    Pusher.disconnect();
                    return clearOnyxForDelegateTransition();
                })
                .then(() =>
                    loadAccountAfterDelegateTransition({
                        accountID: response.accountID,
                        email: response.email,
                        hybridAppAccount: policyID
                            ? {
                                  newDotCurrentAccountEmail: email,
                                  authToken: restrictedToken,
                                  policyID,
                                  accountID: String(session?.accountID ?? CONST.DEFAULT_NUMBER_ID),
                              }
                            : undefined,
                    }).then(() => true),
                );
        })
        .catch((error) => {
            Log.alert('[Delegate] Error connecting as delegate', {error});
            Onyx.update(failureData);
            return false;
        });
}

function disconnect({stashedCredentials, stashedSession}: DisconnectParams): Promise<DisconnectResult> {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: {disconnect: null},
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: undefined,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: {
                        disconnect: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('delegate.genericError'),
                    },
                },
            },
        },
    ];

    // We need to access the authToken directly from the response to update the session
    // Resolves to a DISCONNECT_RESULT so callers can gate work that must run as the original user (e.g. deleting the agent)
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.DISCONNECT_AS_DELEGATE, {}, {optimisticData, successData, failureData}).then(
        (response) => {
            const restoreToStashed = () =>
                restoreDelegateSession({
                    authToken: stashedSession?.authToken,
                    encryptedAuthToken: stashedSession?.encryptedAuthToken,
                    accountID: stashedSession?.accountID,
                    email: stashedSession?.email,
                    stashedCredentials,
                    stashedSession,
                    creationDate: stashedSession?.creationDate,
                });

            const restoreOriginalSession = (): Promise<DisconnectResult> => {
                if (!response?.authToken || !response?.encryptedAuthToken) {
                    Log.alert('[Delegate] No auth token returned while disconnecting as a delegate');
                    return restoreToStashed().then(() => DISCONNECT_RESULT.RESTORED_FROM_STASH);
                }

                if (!response?.requesterID || !response?.requesterEmail) {
                    Log.alert('[Delegate] No requester data returned while disconnecting as a delegate');
                    return restoreToStashed().then(() => DISCONNECT_RESULT.RESTORED_FROM_STASH);
                }

                clearPreservedSearchNavigatorStates();

                const requesterEmail = response.requesterEmail;
                const authToken = response.authToken;
                return SequentialQueue.waitForIdle()
                    .then(() =>
                        restoreDelegateSession({
                            authToken,
                            encryptedAuthToken: response.encryptedAuthToken,
                            accountID: response.requesterID,
                            email: requesterEmail,
                            stashedCredentials,
                            stashedSession,
                        }),
                    )
                    .then(() => DISCONNECT_RESULT.RESTORED);
            };

            return restoreOriginalSession().catch((error) => {
                Log.alert('[Delegate] Error restoring the original session after disconnecting as a delegate', {error});
                return DISCONNECT_RESULT.RESTORE_INTERRUPTED;
            });
        },
        // Only a failed request leaves the copilot session active
        (error) => {
            Log.alert('[Delegate] Error disconnecting as a delegate', {error});
            return DISCONNECT_RESULT.FAILED;
        },
    );
}

function clearDelegatorErrors({delegatedAccess}: ClearDelegatorErrorsParams) {
    if (!delegatedAccess?.delegators) {
        return;
    }
    Onyx.merge(ONYXKEYS.ACCOUNT, {
        delegatedAccess: {
            delegators: delegatedAccess.delegators.map((delegator) => ({
                ...delegator,
                errorFields: undefined,
            })),
        },
    });
}

function addDelegate({email, role, validateCode, delegatedAccess}: AddDelegateParams) {
    if (!delegatedAccess?.delegates) {
        return;
    }

    const existingDelegate = delegatedAccess?.delegates?.find((delegate) => delegate.email === email);

    const optimisticDelegateData = (): Delegate[] => {
        if (existingDelegate) {
            return (
                delegatedAccess.delegates?.map((delegate) =>
                    delegate.email !== email
                        ? delegate
                        : {
                              ...delegate,
                              role,
                              isLoading: true,
                              pendingFields: {
                                  email: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                                  role: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                              },
                              pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                          },
                ) ?? []
            );
        }

        return [
            ...(delegatedAccess.delegates ?? []),
            {
                email,
                role,
                isLoading: true,
                pendingFields: {
                    email: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    role: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        ];
    };

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegates: optimisticDelegateData(),
                    errorFields: {
                        addDelegate: {
                            [email]: null,
                        },
                    },
                },
                isLoading: true,
            },
        },
    ];

    const successDelegateData = (): Delegate[] => {
        if (existingDelegate) {
            return (
                delegatedAccess.delegates?.map((delegate) =>
                    delegate.email !== email
                        ? delegate
                        : {
                              ...delegate,
                              role,
                              isLoading: false,
                              pendingAction: null,
                              pendingFields: {email: null, role: null},
                              optimisticAccountID: undefined,
                          },
                ) ?? []
            );
        }

        return [
            ...(delegatedAccess.delegates ?? []),
            {
                email,
                role,
                isLoading: false,
                pendingAction: null,
                pendingFields: {email: null, role: null},
                optimisticAccountID: undefined,
            },
        ];
    };

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegates: successDelegateData(),
                    errorFields: {
                        addDelegate: {
                            [email]: null,
                        },
                    },
                },
                isLoading: false,
            },
        },
    ];

    const failureDelegateData = (): Delegate[] => {
        if (existingDelegate) {
            return (
                delegatedAccess.delegates?.map((delegate) =>
                    delegate.email !== email
                        ? delegate
                        : {
                              ...delegate,
                              role,
                              isLoading: false,
                          },
                ) ?? []
            );
        }

        return [
            ...(delegatedAccess.delegates ?? []),
            {
                email,
                role,
                isLoading: false,
                pendingFields: {
                    email: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    role: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        ];
    };

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegates: failureDelegateData(),
                },
                isLoading: false,
            },
        },
    ];

    const parameters: APIAddDelegateParams = {
        delegateEmail: email,
        validateCode,
        role,
    };

    API.write(WRITE_COMMANDS.ADD_DELEGATE, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

function removeDelegate({email, delegatedAccess}: RemoveDelegateParams) {
    if (!email || !delegatedAccess?.delegates) {
        return;
    }

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: {
                        removeDelegate: {
                            [email]: null,
                        },
                    },
                    delegates: delegatedAccess.delegates?.map((delegate) =>
                        delegate.email === email
                            ? {
                                  ...delegate,
                                  pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                                  pendingFields: {
                                      email: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                                      role: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                                  },
                              }
                            : delegate,
                    ),
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegates: delegatedAccess.delegates?.filter((delegate) => delegate.email !== email),
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: {
                        removeDelegate: {
                            [email]: null,
                        },
                    },
                    delegates: delegatedAccess.delegates?.map((delegate) =>
                        delegate.email === email
                            ? {
                                  ...delegate,
                                  pendingAction: null,
                                  pendingFields: undefined,
                              }
                            : delegate,
                    ),
                },
            },
        },
    ];

    const parameters: APIRemoveDelegateParams = {delegateEmail: email};

    API.write(WRITE_COMMANDS.REMOVE_DELEGATE, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

function removeDelegator({email, delegatedAccess}: RemoveDelegateParams) {
    if (!email || !delegatedAccess?.delegators) {
        return;
    }

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: {
                        removeDelegator: {
                            [email]: null,
                        },
                    },
                    delegators: delegatedAccess.delegators?.map((delegator) =>
                        delegator.email === email
                            ? {
                                  ...delegator,
                                  pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                                  pendingFields: {
                                      email: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                                      role: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                                  },
                              }
                            : delegator,
                    ),
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegators: delegatedAccess.delegators?.filter((delegator) => delegator.email !== email),
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: {
                        removeDelegator: {
                            [email]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('delegate.genericError'),
                        },
                    },
                    delegators: delegatedAccess.delegators?.map((delegator) =>
                        delegator.email === email
                            ? {
                                  ...delegator,
                                  pendingAction: null,
                                  pendingFields: undefined,
                              }
                            : delegator,
                    ),
                },
            },
        },
    ];

    const parameters: APIRemoveDelegatorParams = {delegatorEmail: email};

    API.write(WRITE_COMMANDS.REMOVE_DELEGATOR, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

type RemoveSelfAsDelegateParams = WithStashedCredentials &
    WithStashedSession & {
        /** Delegator the copilot is acting as */
        delegatorEmail: string;

        /** Acting copilot, whose row shows the error if the session can't be ended */
        delegateEmail: string;
    };

// Set while removeSelfAsDelegate runs, so resuming a pending removal can't queue it twice
let isRemovingSelfAsDelegate = false;

/** Queues the restored copilot's removal from the delegator's copilots, clearing the pending removal with it */
function queueSelfRemovalFromDelegator(delegatorEmail: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT | typeof ONYXKEYS.PENDING_SELF_COPILOT_REMOVAL>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.PENDING_SELF_COPILOT_REMOVAL,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: {
                        removeDelegator: {
                            [delegatorEmail]: null,
                        },
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: {
                        removeDelegator: {
                            [delegatorEmail]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('delegate.genericError'),
                        },
                    },
                },
            },
        },
    ];

    const parameters: APIRemoveDelegatorParams = {delegatorEmail};

    // The restored account's delegators aren't known here, so refetch them after the removal
    API.write(WRITE_COMMANDS.REMOVE_DELEGATOR, parameters, {
        optimisticData,
        failureData,
    });
    openSecuritySettingsPage();
}

/**
 * Removes the acting copilot from the delegator's copilots, restoring the original session first: revoking first
 * invalidates the token the app runs on, and a kill before the restore persists it. See Expensify/App#93458.
 * The removal is saved as pending first, so a kill before it is queued doesn't lose it.
 */
function removeSelfAsDelegate({delegatorEmail, delegateEmail, stashedCredentials, stashedSession}: RemoveSelfAsDelegateParams) {
    isRemovingSelfAsDelegate = true;
    return Onyx.set(ONYXKEYS.PENDING_SELF_COPILOT_REMOVAL, delegatorEmail)
        .then(() => disconnect({stashedCredentials, stashedSession}))
        .then((disconnectResult) => {
            // Only a failed request leaves the copilot on the delegator's account
            if (disconnectResult === DISCONNECT_RESULT.FAILED) {
                Log.alert('[Delegate] Unable to restore the original session, skipping copilot removal');
                Onyx.set(ONYXKEYS.PENDING_SELF_COPILOT_REMOVAL, null);

                // Still acting as the delegator, so show the error on the copilot's own row
                Onyx.merge(ONYXKEYS.ACCOUNT, {
                    delegatedAccess: {
                        errorFields: {
                            removeDelegate: {
                                [delegateEmail]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('delegate.genericError'),
                            },
                        },
                    },
                });
                return;
            }

            queueSelfRemovalFromDelegator(delegatorEmail);
        })
        .finally(() => {
            isRemovingSelfAsDelegate = false;
        });
}

type ResumeSelfRemovalAsDelegateParams = {
    /** Delegator saved as pending by an interrupted removeSelfAsDelegate */
    delegatorEmail: string;

    /** Whether the session still holds the delegator's restricted token */
    isDelegateSession: boolean;
};

/**
 * Finishes a removeSelfAsDelegate a kill interrupted. Back on their own account, the copilot's removal is queued;
 * still acting as the delegator, the restore never happened, so the removal counts as cancelled.
 */
function resumeSelfRemovalAsDelegate({delegatorEmail, isDelegateSession}: ResumeSelfRemovalAsDelegateParams) {
    if (isRemovingSelfAsDelegate) {
        return;
    }

    if (isDelegateSession) {
        Onyx.set(ONYXKEYS.PENDING_SELF_COPILOT_REMOVAL, null);
        return;
    }

    queueSelfRemovalFromDelegator(delegatorEmail);
}

function clearDelegateErrorsByField({email, fieldName, delegatedAccess}: ClearDelegateErrorsByFieldParams) {
    if (!delegatedAccess) {
        return;
    }

    Onyx.merge(ONYXKEYS.ACCOUNT, {
        delegatedAccess: {
            errorFields: {
                [fieldName]: {
                    [email]: null,
                },
            },
        },
    });
}

function isConnectedAsDelegate({delegatedAccess}: IsConnectedAsDelegateParams) {
    return !!delegatedAccess?.delegate;
}

function updateDelegateRole({email, role, validateCode, delegatedAccess}: UpdateDelegateRoleParams) {
    if (!delegatedAccess?.delegates) {
        return;
    }

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: true,
                delegatedAccess: {
                    errorFields: {
                        updateDelegateRole: {
                            [email]: null,
                        },
                    },
                    delegates: delegatedAccess.delegates.map((delegate) =>
                        delegate.email === email
                            ? {
                                  ...delegate,
                                  isLoading: true,
                                  pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                  pendingFields: {
                                      role: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                  },
                              }
                            : delegate,
                    ),
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
                delegatedAccess: {
                    errorFields: {
                        updateDelegateRole: {
                            [email]: null,
                        },
                    },
                    delegates: delegatedAccess.delegates.map((delegate) =>
                        delegate.email === email
                            ? {
                                  ...delegate,
                                  role,
                                  isLoading: false,
                                  pendingAction: null,
                                  pendingFields: {role: null},
                              }
                            : delegate,
                    ),
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
                delegatedAccess: {
                    delegates: delegatedAccess.delegates.map((delegate) =>
                        delegate.email === email
                            ? {
                                  ...delegate,
                                  isLoading: false,
                                  pendingAction: null,
                                  pendingFields: {role: null},
                              }
                            : delegate,
                    ),
                },
            },
        },
    ];

    const parameters: APIUpdateDelegateRoleParams = {
        delegateEmail: email,
        validateCode,
        role,
    };

    API.write(WRITE_COMMANDS.UPDATE_DELEGATE_ROLE, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

/**
 * Parameters used to restore the delegate's (copilot's) own original account when delegate mode ends - either
 * an explicit "disconnect as delegate" or a reauth triggered by an expired delegate token (see `Reauthentication.ts`).
 */
type RestoreDelegateSessionParams = {
    /** Restored auth token for the original user's session */
    authToken?: string;

    /** Restored encrypted auth token for the original user's session */
    encryptedAuthToken?: string;

    /** The original user's account ID being restored */
    accountID?: number;

    /** The original user's email being restored */
    email?: string;

    /** The original user's credentials stashed on delegate entry (CREDENTIALS are wiped when connecting as a delegate), used to rebuild the session */
    stashedCredentials?: Credentials;

    /** The original user's session stashed on delegate entry; written back first because SESSION is preserved across `clearOnyxForDelegateTransition` via `KEYS_TO_PRESERVE_DELEGATE_ACCESS` */
    stashedSession?: Session;

    /** Session creation date to restore so the rebuilt session keeps the correct timestamp */
    creationDate?: number;
};

function restoreDelegateSession({authToken, encryptedAuthToken, accountID, email, stashedCredentials, stashedSession, creationDate = new Date().getTime()}: RestoreDelegateSessionParams) {
    // Write SESSION before the clear: SESSION is in KEYS_TO_PRESERVE_DELEGATE_ACCESS, so clearing
    // preserves the value at clear time. If we cleared first, an interrupted flow would leave
    // SESSION holding the prior delegate-restricted auth token. See Expensify/App#80073.
    return Onyx.set(ONYXKEYS.SESSION, {
        ...(stashedSession ?? {}),
        accountID,
        email,
        authToken,
        encryptedAuthToken,
        creationDate,
    })
        .then(() => {
            NetworkStore.setAuthToken(authToken ?? null);
            // Disconnect Pusher before the transition so it cannot keep pushing updates for the delegate
            // account; it is reinitialized for the restored account after `openApp()`. See Expensify/App#93265.
            Pusher.disconnect();

            // Seeded with the clear: written after it, an interrupted restore would leave the session without credentials
            return clearOnyxForDelegateTransition({
                [ONYXKEYS.CREDENTIALS]: {
                    ...(stashedCredentials ?? {}),
                    accountID,
                },
                [ONYXKEYS.STASHED_CREDENTIALS]: {},
                [ONYXKEYS.STASHED_SESSION]: {},
            });
        })
        .then(() => {
            NetworkStore.setIsAuthenticating(false);

            // Sync the account switch to the classic mobile app experience of HybridApp; otherwise the
            // two experiences disagree about which account is active after a reauth-driven restoration.
            return loadAccountAfterDelegateTransition({
                accountID,
                email,
                hybridAppAccount: email && authToken ? {newDotCurrentAccountEmail: email, authToken, policyID: '', accountID: ''} : undefined,
            });
        });
}

function openSecuritySettingsPage() {
    API.read(READ_COMMANDS.OPEN_SECURITY_SETTINGS_PAGE, null);
}

export {
    KEYS_TO_PRESERVE_DELEGATE_ACCESS,
    DISCONNECT_RESULT,
    connect,
    disconnect,
    clearDelegatorErrors,
    addDelegate,
    clearDelegateErrorsByField,
    restoreDelegateSession,
    isConnectedAsDelegate,
    updateDelegateRole,
    removeDelegate,
    removeDelegator,
    removeSelfAsDelegate,
    resumeSelfRemovalAsDelegate,
    openSecuritySettingsPage,
    clearOnyxForDelegateTransition,
};
