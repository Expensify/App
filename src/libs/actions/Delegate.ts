import HybridAppModule from '@expensify/react-native-hybrid-app';
import Onyx from 'react-native-onyx';
import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import type {AddDelegateParams as APIAddDelegateParams, RemoveDelegateParams as APIRemoveDelegateParams, UpdateDelegateRoleParams as APIUpdateDelegateRoleParams} from '@libs/API/parameters';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import Log from '@libs/Log';
import {clearPreservedSearchNavigatorStates} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import * as NetworkStore from '@libs/Network/NetworkStore';
import * as SequentialQueue from '@libs/Network/SequentialQueue';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Delegate, DelegatedAccess, DelegateRole} from '@src/types/onyx/Account';
import type Credentials from '@src/types/onyx/Credentials';
import type Response from '@src/types/onyx/Response';
import type Session from '@src/types/onyx/Session';
import {confirmReadyToOpenApp, openApp} from './App';
import updateSessionAuthTokens from './Session/updateSessionAuthTokens';
import updateSessionUser from './Session/updateSessionUser';

const KEYS_TO_PRESERVE_DELEGATE_ACCESS = [
    ONYXKEYS.NVP_TRY_FOCUS_MODE,
    ONYXKEYS.PREFERRED_THEME,
    ONYXKEYS.NVP_PREFERRED_LOCALE,
    ONYXKEYS.ARE_TRANSLATIONS_LOADING,
    ONYXKEYS.SESSION,
    ONYXKEYS.STASHED_SESSION,
    ONYXKEYS.HAS_LOADED_APP,
    ONYXKEYS.STASHED_CREDENTIALS,
    ONYXKEYS.HYBRID_APP,

    // We need to preserve the sidebar loaded state since we never unmount the sidebar when connecting as a delegate
    // This allows the report screen to load correctly when the delegate token expires and the delegate is returned to their original account.
    ONYXKEYS.IS_SIDEBAR_LOADED,
    ONYXKEYS.NETWORK,
    ONYXKEYS.SHOULD_USE_STAGING_SERVER,
    ONYXKEYS.IS_DEBUG_MODE_ENABLED,
];

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
    fieldName: 'addDelegate' | 'updateDelegateRole'; // but string could work as well
};

type WithOldDotFlag = {
    isFromOldDot?: boolean;
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
type ConnectParams = WithEmail & WithDelegatedAccess & WithOldDotFlag & WithCredentials & WithSession & WithActivePolicyID;

// Clear pending action for role update
type ClearDelegateRolePendingActionParams = WithEmail & WithDelegatedAccess;

/**
 * Connects the user as a delegate to another account.
 * Returns a Promise that resolves to true on success, false on failure, or undefined if not applicable.
 */
function connect({email, delegatedAccess, credentials, session, activePolicyID, isFromOldDot = false}: ConnectParams) {
    if (!delegatedAccess?.delegators && !isFromOldDot) {
        return;
    }

    Onyx.set(ONYXKEYS.STASHED_CREDENTIALS, credentials ?? {});
    Onyx.set(ONYXKEYS.STASHED_SESSION, session ?? {});

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
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

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
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
                .then(() => Onyx.clear(KEYS_TO_PRESERVE_DELEGATE_ACCESS))
                .then(() => {
                    // Update authToken in Onyx and in our local variables so that API requests will use the new authToken
                    updateSessionAuthTokens(response?.restrictedToken, response?.encryptedAuthToken);

                    NetworkStore.setAuthToken(response?.restrictedToken ?? null);
                    confirmReadyToOpenApp();
                    return openApp().then(() => {
                        if (!CONFIG.IS_HYBRID_APP || !policyID) {
                            return true;
                        }
                        HybridAppModule.switchAccount({
                            newDotCurrentAccountEmail: email,
                            authToken: restrictedToken,
                            policyID,
                            accountID: String(session?.accountID ?? CONST.DEFAULT_NUMBER_ID),
                        });
                        return true;
                    });
                });
        })
        .catch((error) => {
            Log.alert('[Delegate] Error connecting as delegate', {error});
            Onyx.update(failureData);
            return false;
        });
}

function disconnect({stashedCredentials, stashedSession}: DisconnectParams) {
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
                    errorFields: {disconnect: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('delegate.genericError')},
                },
            },
        },
    ];

    // We need to access the authToken directly from the response to update the session
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.DISCONNECT_AS_DELEGATE, {}, {optimisticData, successData, failureData})
        .then((response) => {
            if (!response?.authToken || !response?.encryptedAuthToken) {
                Log.alert('[Delegate] No auth token returned while disconnecting as a delegate');
                restoreDelegateSession(stashedSession ?? {});
                return;
            }

            if (!response?.requesterID || !response?.requesterEmail) {
                Log.alert('[Delegate] No requester data returned while disconnecting as a delegate');
                restoreDelegateSession(stashedSession ?? {});
                return;
            }

            clearPreservedSearchNavigatorStates();

            const requesterEmail = response.requesterEmail;
            const authToken = response.authToken;
            return SequentialQueue.waitForIdle()
                .then(() => Onyx.clear(KEYS_TO_PRESERVE_DELEGATE_ACCESS))
                .then(() => {
                    Onyx.set(ONYXKEYS.CREDENTIALS, {
                        ...stashedCredentials,
                        accountID: response.requesterID,
                    });
                    Onyx.set(ONYXKEYS.SESSION, {
                        ...stashedSession,
                        accountID: response.requesterID,
                        email: requesterEmail,
                        authToken,
                        encryptedAuthToken: response.encryptedAuthToken,
                    });
                    Onyx.merge(ONYXKEYS.ACCOUNT, {
                        primaryLogin: requesterEmail,
                    });
                    Onyx.set(ONYXKEYS.STASHED_CREDENTIALS, {});
                    Onyx.set(ONYXKEYS.STASHED_SESSION, {});

                    NetworkStore.setAuthToken(response?.authToken ?? null);

                    confirmReadyToOpenApp();
                    openApp().then(() => {
                        if (!CONFIG.IS_HYBRID_APP) {
                            return;
                        }
                        HybridAppModule.switchAccount({
                            newDotCurrentAccountEmail: requesterEmail,
                            authToken,
                            policyID: '',
                            accountID: '',
                        });
                    });
                });
        })
        .catch((error) => {
            Log.alert('[Delegate] Error disconnecting as a delegate', {error});
        });
}

function clearDelegatorErrors({delegatedAccess}: ClearDelegatorErrorsParams) {
    if (!delegatedAccess?.delegators) {
        return;
    }
    Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess: {delegators: delegatedAccess.delegators.map((delegator) => ({...delegator, errorFields: undefined}))}});
}

function requestValidationCode() {
    API.write(WRITE_COMMANDS.RESEND_VALIDATE_CODE, null);
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
                              isLoading: true,
                              pendingFields: {email: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, role: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
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
                pendingFields: {email: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, role: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        ];
    };

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT | typeof ONYXKEYS.VALIDATE_ACTION_CODE>> = [
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
                pendingFields: {email: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, role: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
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

    const optimisticResetActionCode = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: ONYXKEYS.VALIDATE_ACTION_CODE,
        value: {
            validateCodeSent: null,
        },
    };
    optimisticData.push(optimisticResetActionCode);

    const parameters: APIAddDelegateParams = {delegateEmail: email, validateCode, role};

    API.write(WRITE_COMMANDS.ADD_DELEGATE, parameters, {optimisticData, successData, failureData});
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
                                  pendingFields: {email: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, role: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
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

    API.write(WRITE_COMMANDS.REMOVE_DELEGATE, parameters, {optimisticData, successData, failureData});
}

function clearDelegateErrorsByField({email, fieldName, delegatedAccess}: ClearDelegateErrorsByFieldParams) {
    if (!delegatedAccess?.delegates) {
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
                                  pendingFields: {role: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
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

    const parameters: APIUpdateDelegateRoleParams = {delegateEmail: email, validateCode, role};

    API.write(WRITE_COMMANDS.UPDATE_DELEGATE_ROLE, parameters, {optimisticData, successData, failureData});
}

function clearDelegateRolePendingAction({email, delegatedAccess}: ClearDelegateRolePendingActionParams) {
    if (!delegatedAccess?.delegates) {
        return;
    }

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegates: delegatedAccess.delegates.map((delegate) =>
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

    Onyx.update(optimisticData);
}

function restoreDelegateSession(authenticateResponse: Response) {
    Onyx.clear(KEYS_TO_PRESERVE_DELEGATE_ACCESS).then(() => {
        updateSessionAuthTokens(authenticateResponse?.authToken, authenticateResponse?.encryptedAuthToken);
        updateSessionUser(authenticateResponse?.accountID, authenticateResponse?.email);

        NetworkStore.setAuthToken(authenticateResponse.authToken ?? null);
        NetworkStore.setIsAuthenticating(false);

        confirmReadyToOpenApp();
        openApp();
    });
}

function openSecuritySettingsPage() {
    API.read(READ_COMMANDS.OPEN_SECURITY_SETTINGS_PAGE, null);
}

export {
    connect,
    disconnect,
    clearDelegatorErrors,
    addDelegate,
    requestValidationCode,
    clearDelegateErrorsByField,
    restoreDelegateSession,
    isConnectedAsDelegate,
    clearDelegateRolePendingAction,
    updateDelegateRole,
    removeDelegate,
    openSecuritySettingsPage,
    KEYS_TO_PRESERVE_DELEGATE_ACCESS,
};
