import {fireEvent, screen} from '@testing-library/react-native';
import axios from 'axios';
import type {AxiosResponse} from 'axios';
import {Str} from 'expensify-common';
import {Linking} from 'react-native';
import Onyx from 'react-native-onyx';
import type {ConnectOptions, OnyxKey} from 'react-native-onyx/dist/types';
import type {ApiCommand, ApiRequestCommandParameters} from '@libs/API/types';
import {formatPhoneNumberWithCountryCode} from '@libs/LocalePhoneNumber';
import {translateLocal} from '@libs/Localize';
import Pusher from '@libs/Pusher';
import PusherConnectionManager from '@libs/PusherConnectionManager';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import * as Session from '@src/libs/actions/Session';
import HttpUtils from '@src/libs/HttpUtils';
import * as NumberUtils from '@src/libs/NumberUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import appSetup from '@src/setup';
import type {Response as OnyxResponse, PersonalDetails, Report} from '@src/types/onyx';
import waitForBatchedUpdates from './waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from './waitForBatchedUpdatesWithAct';

type MockFetch = jest.MockedFn<typeof fetch> & {
    pause: () => void;
    fail: () => void;
    succeed: () => void;
    resume: () => Promise<void>;
    mockAPICommand: <TCommand extends ApiCommand>(command: TCommand, responseHandler: (params: ApiRequestCommandParameters[TCommand]) => OnyxResponse) => void;
};

type ConnectionCallback<TKey extends OnyxKey> = NonNullable<ConnectOptions<TKey>['callback']>;
type ConnectionCallbackParams<TKey extends OnyxKey> = Parameters<ConnectionCallback<TKey>>;

type QueueItem = {
    resolve: (value: Partial<Response> | PromiseLike<Partial<Response>>) => void;
    input: RequestInfo;
    options?: RequestInit;
};

type FormData = {
    entries: () => Array<[string, string | Blob]>;
};

type MockAxios = jest.MockedFunction<typeof axios> & {
    pause: () => void;
    fail: () => void;
    succeed: () => void;
    resume: () => Promise<void>;
    mockAPICommand: <TCommand extends ApiCommand>(command: TCommand, responseHandler: (params: ApiRequestCommandParameters[TCommand]) => OnyxResponse) => void;
};

type AxiosQueueItem = {
    resolve: (value: AxiosResponse<string> | PromiseLike<AxiosResponse<string>>) => void;
    reject: (reason?: Error) => void;
    config: Parameters<typeof axios>[0];
};

function formatPhoneNumber(phoneNumber: string) {
    return formatPhoneNumberWithCountryCode(phoneNumber, 1);
}

function setupApp() {
    beforeAll(() => {
        Linking.setInitialURL('https://new.expensify.com/');
        appSetup();

        // Connect to Pusher
        PusherConnectionManager.init();
        Pusher.init({
            appKey: CONFIG.PUSHER.APP_KEY,
            cluster: CONFIG.PUSHER.CLUSTER,
            authEndpoint: `${CONFIG.EXPENSIFY.DEFAULT_API_ROOT}api/AuthenticatePusher?`,
        });
    });
}

function buildPersonalDetails(login: string, accountID: number, firstName = 'Test'): PersonalDetails {
    return {
        accountID,
        login,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_7.png',
        avatarThumbnail: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_7.png',
        displayName: `${firstName} User`,
        firstName,
        lastName: 'User',
        pronouns: '',
        timezone: CONST.DEFAULT_TIME_ZONE,
        phoneNumber: '',
    };
}

function getOnyxData<TKey extends OnyxKey>(options: ConnectOptions<TKey>) {
    return new Promise<void>((resolve) => {
        const connectionID = Onyx.connect({
            ...options,
            callback: (...params: ConnectionCallbackParams<TKey>) => {
                Onyx.disconnect(connectionID);
                (options.callback as (...args: ConnectionCallbackParams<TKey>) => void)?.(...params);
                resolve();
            },
        });
    });
}

/**
 * Simulate signing in and make sure all API calls in this flow succeed. Every time we add
 * a mockImplementationOnce() we are altering what Network.post() will return.
 */
// cspell:disable-next-line
function signInWithTestUser(accountID = 1, login = 'test@user.com', password = 'Password1', authToken = 'asdfqwerty', firstName = 'Test') {
    const originalXhr = HttpUtils.xhr;

    HttpUtils.xhr = jest.fn().mockImplementation(() => {
        const mockedResponse: OnyxResponse = {
            onyxData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.CREDENTIALS,
                    value: {
                        login,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.ACCOUNT,
                    value: {
                        validated: true,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                    value: {
                        [accountID]: buildPersonalDetails(login, accountID, firstName),
                    },
                },
            ],
            jsonCode: 200,
        };

        // Return a Promise that resolves with the mocked response
        return Promise.resolve(mockedResponse);
    });

    // Simulate user entering their login and populating the credentials.login
    Session.beginSignIn(login);
    return waitForBatchedUpdates()
        .then(() => {
            HttpUtils.xhr = jest.fn().mockImplementation(() => {
                const mockedResponse: OnyxResponse = {
                    onyxData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.SESSION,
                            value: {
                                authToken,
                                accountID,
                                email: login,
                                encryptedAuthToken: authToken,
                            },
                        },
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.CREDENTIALS,
                            value: {
                                autoGeneratedLogin: Str.guid('expensify.cash-'),
                                autoGeneratedPassword: Str.guid(),
                            },
                        },
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.ACCOUNT,
                            value: {
                                isUsingExpensifyCard: false,
                            },
                        },
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.BETAS,
                            value: ['all'],
                        },
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.NVP_PRIVATE_PUSH_NOTIFICATION_ID,
                            value: 'randomID',
                        },
                    ],
                    jsonCode: 200,
                };

                // Return a Promise that resolves with the mocked response
                return Promise.resolve(mockedResponse);
            });
            Session.signIn(password);
            return waitForBatchedUpdates();
        })
        .then(() => {
            HttpUtils.xhr = originalXhr;
        });
}

function signOutTestUser() {
    const originalXhr = HttpUtils.xhr;
    HttpUtils.xhr = jest.fn().mockImplementation(() => {
        const mockedResponse: OnyxResponse = {
            jsonCode: 200,
        };

        // Return a Promise that resolves with the mocked response
        return Promise.resolve(mockedResponse);
    });
    Session.signOutAndRedirectToSignIn();
    return waitForBatchedUpdates().then(() => (HttpUtils.xhr = originalXhr));
}

/**
 * Use for situations where fetch() is required. This mock is stateful and has some additional methods to control its behavior:
 *
 * - pause() – stop resolving promises until you call resume()
 * - resume() - flush the queue of promises, and start resolving new promises immediately
 * - fail() - start returning a failure response
 * - success() - go back to returning a success response
 */
function getGlobalFetchMock(): typeof fetch {
    let queue: QueueItem[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let responses = new Map<string, (params: any) => OnyxResponse>();
    let isPaused = false;
    let shouldFail = false;

    const getResponse = (input: RequestInfo, options?: RequestInit): Partial<Response> =>
        shouldFail
            ? {
                  ok: true,
                  json: () => Promise.resolve({jsonCode: 400}),
              }
            : {
                  ok: true,
                  json: async () => {
                      const commandMatch = typeof input === 'string' ? input.match(/https:\/\/www.expensify.com.dev\/api\/(\w+)\?/) : null;
                      const command = commandMatch ? commandMatch[1] : null;

                      const responseHandler = command ? responses.get(command) : null;
                      if (responseHandler) {
                          const requestData = options?.body instanceof FormData ? Object.fromEntries(options.body) : {};
                          return Promise.resolve({jsonCode: 200, ...responseHandler(requestData)});
                      }

                      return Promise.resolve({jsonCode: 200});
                  },
              };

    const mockFetch = jest.fn().mockImplementation((input: RequestInfo, options?: RequestInit) => {
        if (!isPaused) {
            return Promise.resolve(getResponse(input, options));
        }
        return new Promise((resolve) => {
            queue.push({resolve, input, options});
        });
    }) as MockFetch;

    const baseMockReset = mockFetch.mockReset.bind(mockFetch);
    mockFetch.mockReset = () => {
        baseMockReset();
        queue = [];
        responses = new Map();
        isPaused = false;
        shouldFail = false;
        return mockFetch;
    };

    mockFetch.pause = () => (isPaused = true);
    mockFetch.resume = () => {
        isPaused = false;
        queue.forEach(({resolve, input}) => resolve(getResponse(input)));
        return waitForBatchedUpdates();
    };
    mockFetch.fail = () => (shouldFail = true);
    mockFetch.succeed = () => (shouldFail = false);
    mockFetch.mockAPICommand = <TCommand extends ApiCommand>(command: TCommand, responseHandler: (params: ApiRequestCommandParameters[TCommand]) => OnyxResponse): void => {
        responses.set(command, responseHandler);
    };
    return mockFetch as typeof fetch;
}

/**
 * Use for situations where axios() is required. This mock is stateful and has some additional methods to control its behavior:
 *
 * - pause() – stop resolving promises until you call resume()
 * - resume() - flush the queue of promises, and start resolving new promises immediately
 * - fail() - start returning a failure response
 * - succeed() - go back to returning a success response
 */
function getGlobalAxiosMock(): typeof axios {
    let queue: AxiosQueueItem[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let responses = new Map<string, (params: any) => OnyxResponse>();
    let isPaused = false;
    let shouldFail = false;

    const getResponse = (config: Parameters<typeof axios>[0]): AxiosResponse<string> => {
        const url = typeof config === 'string' ? config : ((config as {url?: string})?.url ?? '');
        const commandMatch = url.match(/https:\/\/www\.expensify\.com\.dev\/api\/(\w+)\?/);
        const command = commandMatch?.at(1) ?? null;

        if (shouldFail) {
            return {
                status: 400,
                statusText: 'Bad Request',
                data: JSON.stringify({jsonCode: 400}),
                headers: {},
                config: config as never,
            } as AxiosResponse<string>;
        }
        const responseHandler = command ? responses.get(command) : null;
        let responseData: Record<string, unknown> = {jsonCode: 200};

        if (responseHandler) {
            const configData = (config as {data?: FormData})?.data;
            const requestData = configData instanceof FormData ? Object.fromEntries(configData) : {};
            responseData = {jsonCode: 200, ...responseHandler(requestData)};
        }

        return {
            status: 200,
            statusText: 'OK',
            data: JSON.stringify(responseData),
            headers: {},
            config: config as never,
        } as AxiosResponse<string>;
    };

    const mockAxios = jest.fn().mockImplementation((config: Parameters<typeof axios>[0]) => {
        if (!isPaused) {
            if (shouldFail) {
                // Reject with a network-like error to simulate actual axios network failure
                return Promise.reject(new Error(CONST.ERROR.FAILED_TO_FETCH));
            }
            return Promise.resolve(getResponse(config));
        }
        return new Promise<AxiosResponse<string>>((resolve, reject) => {
            queue.push({resolve, reject, config});
        });
    }) as unknown as MockAxios;

    const baseMockReset = mockAxios.mockReset.bind(mockAxios);
    mockAxios.mockReset = () => {
        baseMockReset();
        queue = [];
        responses = new Map();
        isPaused = false;
        shouldFail = false;
        return mockAxios;
    };

    mockAxios.pause = () => (isPaused = true);
    mockAxios.resume = () => {
        isPaused = false;
        queue.forEach(({resolve, reject, config}) => {
            if (shouldFail) {
                reject(new Error(CONST.ERROR.FAILED_TO_FETCH));
            } else {
                resolve(getResponse(config));
            }
        });
        queue = [];
        return waitForBatchedUpdates();
    };
    mockAxios.fail = () => (shouldFail = true);
    mockAxios.succeed = () => (shouldFail = false);
    mockAxios.mockAPICommand = <TCommand extends ApiCommand>(command: TCommand, responseHandler: (params: ApiRequestCommandParameters[TCommand]) => OnyxResponse): void => {
        responses.set(command, responseHandler);
    };
    return mockAxios as typeof axios;
}

function setupGlobalFetchMock(): MockFetch {
    const mockFetch = getGlobalFetchMock();
    const originalFetch = global.fetch;

    global.fetch = mockFetch as unknown as typeof global.fetch;

    afterAll(() => {
        global.fetch = originalFetch;
    });

    return mockFetch as MockFetch;
}

function setupGlobalAxiosMock(): MockAxios {
    const mockAxios = getGlobalAxiosMock();
    // Note: This requires jest.mock('axios') to be called at the top of your test file
    // Since HttpUtils calls axios() directly as a function, we mock the default export
    const mockedAxios = axios as jest.MockedFunction<typeof axios>;
    mockedAxios.mockImplementation(mockAxios as unknown as typeof axios);

    return mockAxios as MockAxios;
}

function getFetchMockCalls(commandName: ApiCommand) {
    return (global.fetch as MockFetch).mock.calls.filter((c) => c[0] === `https://www.expensify.com.dev/api/${commandName}?`);
}

function getAxiosMockCalls(commandName: ApiCommand) {
    // Cast to MockedFunction since we're mocking axios as a function (not individual methods)
    const mockedAxios = axios as jest.MockedFunction<typeof axios>;
    const calls = mockedAxios.mock.calls;
    return calls.filter((call) => {
        const config = call[0];
        const url = typeof config === 'string' ? config : ((config as {url?: string})?.url ?? '');
        return url === `https://www.expensify.com.dev/api/${commandName}?`;
    });
}

/**
 * Assertion helper to validate that a command has been called a specific number of times.
 */
function expectAPICommandToHaveBeenCalled(commandName: ApiCommand, expectedCalls: number) {
    expect(getFetchMockCalls(commandName)).toHaveLength(expectedCalls);
}

/**
 * Assertion helper to validate that a command has been called with specific parameters.
 */
function expectAPICommandToHaveBeenCalledWith<TCommand extends ApiCommand>(commandName: TCommand, callIndex: number, expectedParams: ApiRequestCommandParameters[TCommand]) {
    const call = getFetchMockCalls(commandName).at(callIndex);
    expect(call).toBeTruthy();
    const body = (call?.at(1) as RequestInit)?.body;
    const params = body instanceof FormData ? Object.fromEntries(body) : {};
    expect(params).toEqual(expect.objectContaining(expectedParams));
}

/**
 * Assertion helper to validate that an axios command has been called a specific number of times.
 */
function expectAxiosCommandToHaveBeenCalled(commandName: ApiCommand, expectedCalls: number) {
    expect(getAxiosMockCalls(commandName)).toHaveLength(expectedCalls);
}

/**
 * Assertion helper to validate that an axios command has been called with specific parameters.
 */
function expectAxiosCommandToHaveBeenCalledWith<TCommand extends ApiCommand>(commandName: TCommand, callIndex: number, expectedParams: ApiRequestCommandParameters[TCommand]) {
    const call = getAxiosMockCalls(commandName).at(callIndex);
    expect(call).toBeTruthy();
    const config = call?.[0];
    const requestData = (config as {data?: FormData})?.data;
    const params = requestData instanceof FormData ? Object.fromEntries(requestData) : {};
    expect(params).toEqual(expect.objectContaining(expectedParams));
}

function setPersonalDetails(login: string, accountID: number) {
    Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        [accountID]: buildPersonalDetails(login, accountID),
    });
    return waitForBatchedUpdates();
}

function buildTestReportComment(created: string, actorAccountID: number, actionID: string | null = null) {
    const reportActionID = actionID ?? NumberUtils.rand64().toString();
    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        person: [{type: 'TEXT', style: 'strong', text: 'User B'}],
        created,
        message: [{type: 'COMMENT', html: `Comment ${actionID}`, text: `Comment ${actionID}`}],
        reportActionID,
        actorAccountID,
    };
}

function assertFormDataMatchesObject(obj: Report, formData?: FormData) {
    expect(formData).not.toBeUndefined();
    if (formData) {
        expect(
            Array.from(formData.entries()).reduce(
                (acc, [key, val]) => {
                    acc[key] = val;
                    return acc;
                },
                {} as Record<string, string | Blob>,
            ),
        ).toEqual(expect.objectContaining(obj));
    }
}

function getNavigateToChatHintRegex(): RegExp {
    const hintTextPrefix = translateLocal('accessibilityHints.navigatesToChat');
    return new RegExp(hintTextPrefix, 'i');
}

async function navigateToSidebarOption(index: number): Promise<void> {
    const optionRow = screen.queryAllByAccessibilityHint(getNavigateToChatHintRegex()).at(index);
    if (!optionRow) {
        return;
    }
    fireEvent(optionRow, 'press');
    await waitForBatchedUpdatesWithAct();
}

/**
 * @private
 * This is a custom collator only for testing purposes.
 */
const customCollator = new Intl.Collator('en', {usage: 'sort', sensitivity: 'variant', numeric: true, caseFirst: 'upper'});

function localeCompare(a: string, b: string): number {
    return customCollator.compare(a, b);
}

export type {MockFetch, MockAxios, FormData};

export {
    assertFormDataMatchesObject,
    buildPersonalDetails,
    buildTestReportComment,
    getFetchMockCalls,
    getAxiosMockCalls,
    getGlobalFetchMock,
    getGlobalAxiosMock,
    setPersonalDetails,
    signInWithTestUser,
    signOutTestUser,
    setupApp,
    expectAPICommandToHaveBeenCalled,
    expectAPICommandToHaveBeenCalledWith,
    expectAxiosCommandToHaveBeenCalled,
    expectAxiosCommandToHaveBeenCalledWith,
    setupGlobalFetchMock,
    setupGlobalAxiosMock,
    navigateToSidebarOption,
    getOnyxData,
    getNavigateToChatHintRegex,
    formatPhoneNumber,
    localeCompare,
};
