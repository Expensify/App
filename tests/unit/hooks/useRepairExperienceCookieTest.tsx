import {act, renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useRepairExperienceCookie from '@hooks/useRepairExperienceCookie';

import {clearExperienceCookie, isSharedProductHost, readExperienceCookie} from '@libs/ExperienceCookie';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, BetaConfiguration, Session} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockOpenClassic = jest.fn();

jest.mock('@hooks/useOpenClassic', () => ({__esModule: true, default: () => mockOpenClassic}));
jest.mock('@libs/ExperienceCookie', () => ({
    isSharedProductHost: jest.fn(),
    readExperienceCookie: jest.fn(),
    clearExperienceCookie: jest.fn(() => true),
    writeExperienceCookie: jest.fn(() => true),
}));

type ExperienceCookieValue = ValueOf<typeof CONST.EXPERIENCE_COOKIE.VALUES>;

type AccountState = {
    /** The account's betas, or undefined while they haven't loaded */
    betas?: Beta[];

    /** The server's beta configuration, or undefined while it hasn't loaded */
    betaConfiguration?: BetaConfiguration;

    /** Whether the account prefers Classic, as saved in its tryNewDot setting */
    prefersClassic?: boolean;

    session?: Partial<Session>;
};

const REPAIR_KEY = CONST.SESSION_STORAGE_KEYS.EXPERIENCE_COOKIE_REPAIR;
const IN_BETA: Beta[] = [CONST.BETAS.HYBRID_WEB];
const OUTSIDE_BETA: Beta[] = [];

function Wrapper({children}: {children: React.ReactNode}) {
    return <OnyxListItemProvider>{children}</OnyxListItemProvider>;
}

/** Stands in for the account data the app has before the server responds, from the cache of an earlier session */
async function arrangeAccount({betas = IN_BETA, betaConfiguration = {explicitOnly: []}, prefersClassic = false, session}: AccountState = {}) {
    await Onyx.multiSet({
        [ONYXKEYS.BETAS]: betas,
        [ONYXKEYS.BETA_CONFIGURATION]: betaConfiguration,
        [ONYXKEYS.SESSION]: {accountID: 1, email: 'user@expensify.com', authToken: 'token', ...session},
    });
    await Onyx.merge(ONYXKEYS.NVP_TRY_NEW_DOT, {classicRedirect: {dismissed: prefersClassic}});
    await waitForBatchedUpdatesWithAct();
}

function arrangeCookie(cookie: ExperienceCookieValue | undefined) {
    jest.mocked(readExperienceCookie).mockReturnValue(cookie);
}

async function renderRepair() {
    const rendered = renderHook(() => useRepairExperienceCookie(), {wrapper: Wrapper});
    await waitForBatchedUpdatesWithAct();
    return rendered;
}

/** Stands in for a successful OpenApp or ReconnectApp, whose response is applied together with its success data */
async function receiveFreshAppData(prefersClassic?: boolean) {
    await act(async () => {
        await Onyx.update([
            ...(prefersClassic === undefined ? [] : [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_TRY_NEW_DOT, value: {classicRedirect: {dismissed: prefersClassic}}} as const]),
            {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.RAM_ONLY_HAS_FRESH_APP_DATA, value: true},
        ]);
    });
    await waitForBatchedUpdatesWithAct();
}

describe('useRepairExperienceCookie', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        sessionStorage.clear();
        jest.clearAllMocks();
        jest.mocked(isSharedProductHost).mockReturnValue(true);
        arrangeCookie(CONST.EXPERIENCE_COOKIE.VALUES.NEW);
    });

    it('opens Classic once the server says an account in the beta prefers Classic but the cookie keeps it in New Expensify', async () => {
        // Given a cookie that sends the user to New Expensify, and a cache that still says the account uses it
        await arrangeAccount({prefersClassic: false});
        await renderRepair();

        // When the server responds that the account switched to Classic elsewhere
        await receiveFreshAppData(true);

        // Then Classic opens to correct the cookie, and the tab remembers it, so a disagreement can't send it back and forth
        expect(mockOpenClassic).toHaveBeenCalledTimes(1);
        expect(clearExperienceCookie).not.toHaveBeenCalled();
        expect(sessionStorage.getItem(REPAIR_KEY)).not.toBeNull();
    });

    it('waits for the server before deciding', async () => {
        // Given a cache that says the account prefers Classic
        await arrangeAccount({prefersClassic: true});
        await renderRepair();

        // When only the loading flag changes, as it does for a failed request or a request outside the app start
        await act(async () => {
            await Onyx.merge(ONYXKEYS.IS_LOADING_REPORT_DATA, true);
            await Onyx.merge(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
        });
        await waitForBatchedUpdatesWithAct();

        // Then nothing happens, because the cache may be older than the account's settings
        expect(mockOpenClassic).not.toHaveBeenCalled();
    });

    it('decides only once per start', async () => {
        // Given an account that keeps using New Expensify when the server first responds
        await arrangeAccount({prefersClassic: false});
        await renderRepair();
        await receiveFreshAppData();

        // When a later reconnect brings the account's switch to Classic, which the switch itself already handles
        await receiveFreshAppData(true);

        // Then Classic isn't opened a second time
        expect(mockOpenClassic).not.toHaveBeenCalled();
    });

    it('clears the cookie and opens Classic for an account removed from the beta', async () => {
        // Given an account that left the beta, whose cookie still sends it to New Expensify
        await arrangeAccount({betas: OUTSIDE_BETA});
        await renderRepair();

        // When the server responds
        await receiveFreshAppData();

        // Then the cookie is removed before Classic opens, so expensify.com stops routing the account by it
        expect(clearExperienceCookie).toHaveBeenCalledTimes(1);
        expect(mockOpenClassic).toHaveBeenCalledTimes(1);
        expect(jest.mocked(clearExperienceCookie).mock.invocationCallOrder.at(0)).toBeLessThan(mockOpenClassic.mock.invocationCallOrder.at(0) ?? 0);
    });

    it.each<[string, AccountState, ExperienceCookieValue | undefined]>([
        ['an account in the beta that uses New Expensify', {prefersClassic: false}, CONST.EXPERIENCE_COOKIE.VALUES.NEW],
        ['a Classic account that opened a New Expensify link with a classic cookie', {prefersClassic: true}, CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC],
        ['a Classic account that opened a New Expensify link without a cookie', {prefersClassic: true}, undefined],
        ['an account outside the beta with a classic cookie', {betas: OUTSIDE_BETA}, CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC],
        ['an account outside the beta without a cookie', {betas: OUTSIDE_BETA}, undefined],
        ['a Supportal agent on a Classic account', {prefersClassic: true, session: {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT}}, CONST.EXPERIENCE_COOKIE.VALUES.NEW],
        ['a Copilot on a Classic account', {prefersClassic: true, session: {authTokenType: CONST.AUTH_TOKEN_TYPES.DELEGATE}}, CONST.EXPERIENCE_COOKIE.VALUES.NEW],
    ])('stays in New Expensify and allows a later repair for %s', async (_, account, cookie) => {
        // Given a tab that already repaired the cookie once
        sessionStorage.setItem(REPAIR_KEY, '1');
        await arrangeAccount(account);
        arrangeCookie(cookie);
        await renderRepair();

        // When the server responds
        await receiveFreshAppData();

        // Then nothing changes, and the tab can repair the cookie again, because staying here ends any back and forth
        expect(mockOpenClassic).not.toHaveBeenCalled();
        expect(clearExperienceCookie).not.toHaveBeenCalled();
        expect(sessionStorage.getItem(REPAIR_KEY)).toBeNull();
    });

    it.each([ONYXKEYS.BETAS, ONYXKEYS.BETA_CONFIGURATION])('stays in New Expensify while %s is unknown', async (key) => {
        // Given a tab that already repaired the cookie once, and an account that looks outside the beta, but whose betas or beta configuration haven't loaded
        sessionStorage.setItem(REPAIR_KEY, '1');
        await arrangeAccount({betas: OUTSIDE_BETA});
        await Onyx.set(key, null);
        await renderRepair();

        // When the server responds without them
        await receiveFreshAppData();

        // Then the user isn't moved, because the account may still be in the beta, and the tab can repair the cookie again
        expect(mockOpenClassic).not.toHaveBeenCalled();
        expect(clearExperienceCookie).not.toHaveBeenCalled();
        expect(sessionStorage.getItem(REPAIR_KEY)).toBeNull();
    });

    it('does not repair twice in one tab', async () => {
        // Given a tab that already opened Classic to repair the cookie, and came back to New Expensify with the same mismatch
        sessionStorage.setItem(REPAIR_KEY, '1');
        const logHmmm = jest.spyOn(Log, 'hmmm');
        await arrangeAccount({prefersClassic: true});
        await renderRepair();

        // When the server responds
        await receiveFreshAppData();

        // Then the tab stays here, because Classic and New Expensify disagree about the account, and the mark is kept
        expect(mockOpenClassic).not.toHaveBeenCalled();
        expect(logHmmm).toHaveBeenCalledWith(expect.stringContaining('[ExperienceCookie]'));
        expect(sessionStorage.getItem(REPAIR_KEY)).not.toBeNull();
        logHmmm.mockRestore();
    });

    it('does not repair when the tab cannot remember the repair', async () => {
        // Given a browser that blocks sessionStorage
        const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('Access denied');
        });
        await arrangeAccount({prefersClassic: true});
        await renderRepair();

        // When the server responds
        await receiveFreshAppData();

        // Then the tab stays here, since without the mark nothing stops it from being sent back and forth
        expect(mockOpenClassic).not.toHaveBeenCalled();
        getItem.mockRestore();
    });

    it('does nothing outside the host that serves both products', async () => {
        // Given New Expensify on its own host
        jest.mocked(isSharedProductHost).mockReturnValue(false);
        await arrangeAccount({prefersClassic: true});
        await renderRepair();

        // When the server responds
        await receiveFreshAppData();

        // Then the cookie, which only expensify.com uses, is left alone
        expect(mockOpenClassic).not.toHaveBeenCalled();
        expect(readExperienceCookie).not.toHaveBeenCalled();
    });
});
