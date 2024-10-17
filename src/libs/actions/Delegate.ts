import {NativeModules} from 'react-native';
import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import type {AddDelegateParams, RemoveDelegateParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import Log from '@libs/Log';
import * as NetworkStore from '@libs/Network/NetworkStore';
import {getCurrentUserEmail} from '@libs/Network/NetworkStore';
import * as SequentialQueue from '@libs/Network/SequentialQueue';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Delegate, DelegatedAccess, DelegateRole} from '@src/types/onyx/Account';
import type Response from '@src/types/onyx/Response';
import {confirmReadyToOpenApp, openApp} from './App';
import updateSessionAuthTokens from './Session/updateSessionAuthTokens';
import updateSessionUser from './Session/updateSessionUser';

let delegatedAccess: DelegatedAccess;
Onyx.connect({
    key: ONYXKEYS.ACCOUNT,
    callback: (val) => {
        delegatedAccess = val?.delegatedAccess ?? {};
    },
});

const KEYS_TO_PRESERVE_DELEGATE_ACCESS = [
    ONYXKEYS.NVP_TRY_FOCUS_MODE,
    ONYXKEYS.PREFERRED_THEME,
    ONYXKEYS.NVP_PREFERRED_LOCALE,
    ONYXKEYS.SESSION,
    ONYXKEYS.IS_LOADING_APP,
    ONYXKEYS.CREDENTIALS,

    // We need to preserve the sidebar loaded state since we never unrender the sidebar when connecting as a delegate
    // This allows the report screen to load correctly when the delegate token expires and the delegate is returned to their original account.
    ONYXKEYS.IS_SIDEBAR_LOADED,
];

function connect(email: string) {
    if (!delegatedAccess?.delegators) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegators: delegatedAccess.delegators.map((delegator) => (delegator.email === email ? {...delegator, errorFields: {connect: null}} : delegator)),
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegators: delegatedAccess.delegators.map((delegator) => (delegator.email === email ? {...delegator, errorFields: undefined} : delegator)),
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegators: delegatedAccess.delegators.map((delegator) =>
                        delegator.email === email ? {...delegator, errorFields: {connect: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('delegate.genericError')}} : delegator,
                    ),
                },
            },
        },
    ];

    // We need to access the authToken directly from the response to update the session
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.CONNECT_AS_DELEGATE, {to: email}, {optimisticData, successData, failureData})
        .then((response) => {
            if (!response?.restrictedToken || !response?.encryptedAuthToken) {
                Log.alert('[Delegate] No auth token returned while connecting as a delegate');
                Onyx.update(failureData);
                return;
            }
            return SequentialQueue.waitForIdle()
                .then(() => Onyx.clear(KEYS_TO_PRESERVE_DELEGATE_ACCESS))
                .then(() => {
                    // Update authToken in Onyx and in our local variables so that API requests will use the new authToken
                    updateSessionAuthTokens(response?.restrictedToken, response?.encryptedAuthToken);

                    NetworkStore.setAuthToken(response?.restrictedToken ?? null);
                    confirmReadyToOpenApp();
                    openApp();

                    NativeModules.HybridAppModule.switchAccount(email);
                });
        })
        .catch((error) => {
            Log.alert('[Delegate] Error connecting as delegate', {error});
            Onyx.update(failureData);
        });
}

function disconnect() {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: {connect: null},
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
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

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    errorFields: {connect: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('delegate.genericError')},
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
                return;
            }

            return SequentialQueue.waitForIdle()
                .then(() => Onyx.clear(KEYS_TO_PRESERVE_DELEGATE_ACCESS))
                .then(() => {
                    // Update authToken in Onyx and in our local variables so that API requests will use the new authToken
                    updateSessionAuthTokens(response?.authToken, response?.encryptedAuthToken);

                    NetworkStore.setAuthToken(response?.authToken ?? null);
                    confirmReadyToOpenApp();
                    openApp();

                    NativeModules.HybridAppModule.switchAccount(getCurrentUserEmail() ?? '');
                });
        })
        .catch((error) => {
            Log.alert('[Delegate] Error disconnecting as a delegate', {error});
        });
}

function clearDelegatorErrors() {
    if (!delegatedAccess?.delegators) {
        return;
    }
    Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess: {delegators: delegatedAccess.delegators.map((delegator) => ({...delegator, errorFields: undefined}))}});
}

function requestValidationCode() {
    API.write(WRITE_COMMANDS.RESEND_VALIDATE_CODE, null);
}

function addDelegate(email: string, role: DelegateRole, validateCode: string) {
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
                              errorFields: {addDelegate: null},
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
                errorFields: {addDelegate: null},
                pendingFields: {email: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, role: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        ];
    };

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegates: optimisticDelegateData(),
                },
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
                              errorFields: {addDelegate: null},
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
                errorFields: {addDelegate: null},
                isLoading: false,
                pendingAction: null,
                pendingFields: {email: null, role: null},
                optimisticAccountID: undefined,
            },
        ];
    };

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegates: successDelegateData(),
                },
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
                              errorFields: {addDelegate: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('contacts.genericFailureMessages.validateSecondaryLogin')},
                          },
                ) ?? []
            );
        }

        return [
            ...(delegatedAccess.delegates ?? []),
            {
                email,
                role,
                errorFields: {
                    addDelegate: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('contacts.genericFailureMessages.validateSecondaryLogin'),
                },
                isLoading: false,
                pendingFields: {email: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, role: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        ];
    };

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegates: failureDelegateData(),
                },
            },
        },
    ];

    const parameters: AddDelegateParams = {delegate: email, validateCode, role};

    API.write(WRITE_COMMANDS.ADD_DELEGATE, parameters, {optimisticData, successData, failureData});
}

function removeDelegate(email: string) {
    if (!email) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegates: delegatedAccess.delegates?.map((delegate) =>
                        delegate.email === email
                            ? {
                                  ...delegate,
                                  errorFields: {removeDelegate: null},
                                  pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                                  pendingFields: {email: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, role: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
                              }
                            : delegate,
                    ),
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
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

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegates: delegatedAccess.delegates?.map((delegate) =>
                        delegate.email === email
                            ? {
                                  ...delegate,
                                  errorFields: {
                                      removeDelegate: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('delegate.genericError'),
                                  },
                                  pendingAction: null,
                                  pendingFields: undefined,
                              }
                            : delegate,
                    ),
                },
            },
        },
    ];

    const parameters: RemoveDelegateParams = {delegate: email};

    API.write(WRITE_COMMANDS.REMOVE_DELEGATE, parameters, {optimisticData, successData, failureData});
}

function clearAddDelegateErrors(email: string, fieldName: string) {
    if (!delegatedAccess?.delegates) {
        return;
    }

    Onyx.merge(ONYXKEYS.ACCOUNT, {
        delegatedAccess: {
            delegates: delegatedAccess.delegates.map((delegate) => (delegate.email !== email ? delegate : {...delegate, errorFields: {...delegate.errorFields, [fieldName]: null}})),
        },
    });
}

function isConnectedAsDelegate() {
    return !!delegatedAccess?.delegate;
}

function removePendingDelegate(email: string) {
    if (!delegatedAccess?.delegates) {
        return;
    }

    Onyx.merge(ONYXKEYS.ACCOUNT, {
        delegatedAccess: {
            delegates: delegatedAccess.delegates.filter((delegate) => delegate.email !== email),
        },
    });
}

function updateDelegateRole(email: string, role: DelegateRole, validateCode: string) {
    if (!delegatedAccess?.delegates) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegates: delegatedAccess.delegates.map((delegate) =>
                        delegate.email === email
                            ? {
                                  ...delegate,
                                  role,
                                  errorFields: {updateDelegateRole: null},
                                  pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                  pendingFields: {role: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                  isLoading: true,
                              }
                            : delegate,
                    ),
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegates: delegatedAccess.delegates.map((delegate) =>
                        delegate.email === email
                            ? {
                                  ...delegate,
                                  role,
                                  errorFields: {updateDelegateRole: null},
                                  pendingAction: null,
                                  pendingFields: {role: null},
                                  isLoading: false,
                              }
                            : delegate,
                    ),
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegates: delegatedAccess.delegates.map((delegate) =>
                        delegate.email === email
                            ? {
                                  ...delegate,
                                  errorFields: {
                                      updateDelegateRole: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('delegate.genericError'),
                                  },
                                  isLoading: false,
                                  pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                  pendingFields: {role: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                              }
                            : delegate,
                    ),
                },
            },
        },
    ];

    const parameters = {delegate: email, validateCode, role};

    API.write(WRITE_COMMANDS.UPDATE_DELEGATE_ROLE, parameters, {optimisticData, successData, failureData});
}

function updateDelegateRoleOptimistically(email: string, role: DelegateRole) {
    if (!delegatedAccess?.delegates) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                delegatedAccess: {
                    delegates: delegatedAccess.delegates.map((delegate) =>
                        delegate.email === email
                            ? {
                                  ...delegate,
                                  role,
                                  errorFields: {updateDelegateRole: null},
                                  pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                  pendingFields: {role: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                              }
                            : delegate,
                    ),
                },
            },
        },
    ];

    Onyx.update(optimisticData);
}

function clearDelegateRolePendingAction(email: string) {
    if (!delegatedAccess?.delegates) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
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

export {
    connect,
    disconnect,
    clearDelegatorErrors,
    addDelegate,
    requestValidationCode,
    clearAddDelegateErrors,
    removePendingDelegate,
    restoreDelegateSession,
    isConnectedAsDelegate,
    updateDelegateRoleOptimistically,
    clearDelegateRolePendingAction,
    updateDelegateRole,
    removeDelegate,
    KEYS_TO_PRESERVE_DELEGATE_ACCESS,
};
