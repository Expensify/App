import type Environment from '@libs/Environment/getEnvironment/types';
import type {Fullstory} from '@libs/Fullstory/types';

import CONST from '@src/CONST';
import getEnvironment from '@src/libs/Environment/getEnvironment';
import type UserMetadata from '@src/types/onyx/UserMetadata';

import {FullStory as FullStoryBrowser, isInitialized} from '@fullstory/browser';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@src/libs/Environment/getEnvironment', () => ({
    __esModule: true,
    // Keep a resolving default implementation - modules loaded transitively (e.g. ApiUtils) call
    // getEnvironment().then(...) at import time, before the tests configure the mock.
    default: jest.fn(() => Promise.resolve('production')),
}));

// Fullstory/common pulls in ReportUtils and most of the app behind it - mock it to keep the suite light.
jest.mock('@libs/Fullstory/common', () => ({
    getChatFSClass: jest.fn(),
    shouldInitializeFullstory: jest.fn().mockReturnValue(true),
}));

jest.mock('@userActions/Session', () => ({
    isSupportAuthToken: jest.fn().mockReturnValue(false),
}));

jest.mock('@fullstory/browser', () => ({
    FullStory: jest.fn(),
    init: jest.fn(),
    isInitialized: jest.fn().mockReturnValue(false),
}));

jest.mock('@fullstory/react-native', () => ({
    __esModule: true,
    FSPage: jest.fn(),
    default: {
        onReady: jest.fn().mockResolvedValue(undefined),
        consent: jest.fn(),
        identify: jest.fn(),
        restart: jest.fn(),
        anonymize: jest.fn(),
    },
}));

// Under jest the '@libs/Fullstory' specifier resolves to the native variant (index.native.ts),
// so we load each platform implementation explicitly to cover both.
const webFS = jest.requireActual<{default: Fullstory}>('@libs/Fullstory/index.ts').default;
const nativeFS = jest.requireActual<{default: Fullstory}>('@libs/Fullstory/index.native.ts').default;

const getEnvironmentMock = jest.mocked(getEnvironment);

const accountID = 123;
const email = 'utester+fullstory125@gmail.com';

function createDeferred<T = void>() {
    let resolve: (value: T) => void = () => {};
    const promise = new Promise<T>((promiseResolve) => {
        resolve = promiseResolve;
    });
    return {promise, resolve};
}

afterEach(() => {
    jest.restoreAllMocks();
    getEnvironmentMock.mockReset();
    // restoreAllMocks does not reset module-factory mocks, so put isInitialized back to its default.
    jest.mocked(isInitialized).mockReturnValue(false);
});

describe('Fullstory consentAndIdentify (web)', () => {
    it('identifies with the freshest metadata when a stale email-less chain resolves last', async () => {
        // Given a new account whose USER_METADATA arrives in two stages: {accountID} first, then {accountID, email}.
        // Chain A (email-less) starts first but its onReady resolves last (the init/setTimeout fallback path),
        // while chain B (with email) resolves immediately (the OBSERVE path).
        jest.spyOn(webFS, 'shouldInitialize').mockReturnValue(true);
        const identifySpy = jest.spyOn(webFS, 'identify').mockImplementation(() => {});
        const staleChain = createDeferred();
        const freshChain = createDeferred();
        jest.spyOn(webFS, 'onReady').mockReturnValueOnce(staleChain.promise).mockReturnValueOnce(freshChain.promise);
        getEnvironmentMock.mockResolvedValue(CONST.ENVIRONMENT.PRODUCTION);

        webFS.consentAndIdentify({accountID});
        webFS.consentAndIdentify({accountID, email});
        await waitForBatchedUpdates();

        // When the email chain resolves first and the email-less chain resolves after it
        freshChain.resolve();
        await waitForBatchedUpdates();
        staleChain.resolve();
        await waitForBatchedUpdates();

        // Then the late chain must not clobber the identity - the final identify call still carries the email
        expect(identifySpy).toHaveBeenCalledTimes(2);
        expect(identifySpy).toHaveBeenLastCalledWith({accountID, email, environment: CONST.ENVIRONMENT.PRODUCTION});
    });

    it('identifies with the email when a single update already contains it', async () => {
        jest.spyOn(webFS, 'shouldInitialize').mockReturnValue(true);
        const identifySpy = jest.spyOn(webFS, 'identify').mockImplementation(() => {});
        jest.spyOn(webFS, 'onReady').mockResolvedValue(undefined);
        getEnvironmentMock.mockResolvedValue(CONST.ENVIRONMENT.PRODUCTION);

        webFS.consentAndIdentify({accountID, email});
        await waitForBatchedUpdates();

        expect(identifySpy).toHaveBeenCalledTimes(1);
        expect(identifySpy).toHaveBeenLastCalledWith({accountID, email, environment: CONST.ENVIRONMENT.PRODUCTION});
    });

    it('does not identify a late-resolving chain when the current user switched to an ineligible account', async () => {
        // Given an eligible account starts identification, then the user switches to an ineligible account
        // (its metadata becomes the latest) while the first chain's onReady is still pending.
        const identifySpy = jest.spyOn(webFS, 'identify').mockImplementation(() => {});
        const ineligibleAccountID = 999;
        jest.spyOn(webFS, 'shouldInitialize').mockImplementation((metadata) => metadata?.accountID === accountID);
        const pendingChain = createDeferred();
        jest.spyOn(webFS, 'onReady').mockReturnValue(pendingChain.promise);
        getEnvironmentMock.mockResolvedValue(CONST.ENVIRONMENT.PRODUCTION);
        // FS is already running (e.g. from the eligible account), so the ineligible switch must shut it down.
        jest.mocked(isInitialized).mockReturnValue(true);
        const fullStoryMock = jest.mocked(FullStoryBrowser);
        fullStoryMock.mockClear();

        webFS.consentAndIdentify({accountID, email});
        await waitForBatchedUpdates();
        webFS.consentAndIdentify({accountID: ineligibleAccountID});
        await waitForBatchedUpdates();

        // When the first chain's onReady resolves after the switch
        pendingChain.resolve();
        await waitForBatchedUpdates();

        // Then it must not identify the now-current ineligible account, and it must shut FS down instead
        expect(identifySpy).not.toHaveBeenCalledWith(expect.objectContaining({accountID: ineligibleAccountID}), expect.anything());
        expect(identifySpy).not.toHaveBeenCalledWith(expect.objectContaining({accountID: ineligibleAccountID}));
        expect(fullStoryMock).toHaveBeenCalledWith(CONST.FULLSTORY.OPERATION.SHUTDOWN);
    });

    it('does not mutate the metadata object held by Onyx', async () => {
        jest.spyOn(webFS, 'shouldInitialize').mockReturnValue(true);
        jest.spyOn(webFS, 'identify').mockImplementation(() => {});
        jest.spyOn(webFS, 'onReady').mockResolvedValue(undefined);
        getEnvironmentMock.mockResolvedValue(CONST.ENVIRONMENT.PRODUCTION);

        const userMetadata: UserMetadata = {accountID, email};
        webFS.consentAndIdentify(userMetadata);
        await waitForBatchedUpdates();

        expect(userMetadata).not.toHaveProperty('environment');
    });
});

describe('Fullstory consentAndIdentify (native)', () => {
    it('identifies with the freshest metadata when a stale email-less chain resolves last', async () => {
        // Given the same two-stage metadata race, with the email-less chain's environment lookup resolving last
        jest.spyOn(nativeFS, 'shouldInitialize').mockReturnValue(true);
        const identifySpy = jest.spyOn(nativeFS, 'identify').mockImplementation(() => {});
        const staleChain = createDeferred<Environment>();
        const freshChain = createDeferred<Environment>();
        getEnvironmentMock.mockReturnValueOnce(staleChain.promise).mockReturnValueOnce(freshChain.promise);

        nativeFS.consentAndIdentify({accountID});
        nativeFS.consentAndIdentify({accountID, email});

        // When the email chain resolves first and the email-less chain resolves after it
        freshChain.resolve(CONST.ENVIRONMENT.PRODUCTION);
        await waitForBatchedUpdates();
        staleChain.resolve(CONST.ENVIRONMENT.PRODUCTION);
        await waitForBatchedUpdates();

        // Then the final identify call still carries the email
        expect(identifySpy).toHaveBeenCalledTimes(2);
        expect(identifySpy).toHaveBeenLastCalledWith({accountID, email}, CONST.ENVIRONMENT.PRODUCTION);
    });

    it('identifies with the email when a single update already contains it', async () => {
        jest.spyOn(nativeFS, 'shouldInitialize').mockReturnValue(true);
        const identifySpy = jest.spyOn(nativeFS, 'identify').mockImplementation(() => {});
        getEnvironmentMock.mockResolvedValue(CONST.ENVIRONMENT.PRODUCTION);

        nativeFS.consentAndIdentify({accountID, email});
        await waitForBatchedUpdates();

        expect(identifySpy).toHaveBeenCalledTimes(1);
        expect(identifySpy).toHaveBeenLastCalledWith({accountID, email}, CONST.ENVIRONMENT.PRODUCTION);
    });
});
