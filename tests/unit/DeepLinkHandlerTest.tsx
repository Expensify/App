import {act, render, waitFor} from '@testing-library/react-native';

import {openReportFromDeepLink} from '@libs/actions/Link';
import * as Report from '@libs/actions/Report';

import CONST from '@src/CONST';
import DeepLinkHandler from '@src/DeepLinkHandler';
import ONYXKEYS from '@src/ONYXKEYS';

import {Linking} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/actions/Link', () => ({
    openReportFromDeepLink: jest.fn(),
}));

jest.mock('@libs/actions/Report', () => ({
    ...jest.requireActual<typeof Report>('@libs/actions/Report'),
    openReport: jest.fn(),
    doneCheckingPublicRoom: jest.fn(),
}));

const PUBLIC_ROOM_ID = '987654321';
const DEFAULT_URL = 'https://new.expensify.com/';

async function prepareDeepLinkSession() {
    await act(async () => {
        await Onyx.multiSet({
            [ONYXKEYS.SESSION]: {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS},
            [ONYXKEYS.IS_LOADING_APP]: true,
            [ONYXKEYS.CONCIERGE_REPORT_ID]: '',
            [ONYXKEYS.NVP_INTRO_SELECTED]: {},
            [ONYXKEYS.BETAS]: [],
        });
    });
    await waitForBatchedUpdatesWithAct();
}

describe('DeepLinkHandler', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
        Linking.setInitialURL(DEFAULT_URL);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it('re-fetches a public room that is missing from Onyx after OpenApp settles for an anonymous user (#92672)', async () => {
        // An anonymous session has no authToken, so hasAuthToken() is false and isAnonymousUser() is true.
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS},
                [ONYXKEYS.IS_LOADING_APP]: true,
                [ONYXKEYS.CONCIERGE_REPORT_ID]: '',
                [ONYXKEYS.NVP_INTRO_SELECTED]: {},
                [ONYXKEYS.BETAS]: [],
            });
        });

        // Cold deep link straight into the public room.
        Linking.setInitialURL(`new-expensify://r/${PUBLIC_ROOM_ID}`);

        render(<DeepLinkHandler onInitialUrl={jest.fn()} />);
        await waitForBatchedUpdatesWithAct();

        // While OpenApp is still loading, we should not refetch yet.
        expect(Report.openReport).not.toHaveBeenCalled();

        // OpenApp settles but the public room is still absent from Onyx -> refetch it so it reaches the LHN.
        await act(async () => {
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });
        await waitForBatchedUpdatesWithAct();

        expect(Report.openReport).toHaveBeenCalledWith(expect.objectContaining({reportID: PUBLIC_ROOM_ID}));
    });

    it('threads onboarding status from NVP_ONBOARDING into the refetch openReport (#66424)', async () => {
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS},
                [ONYXKEYS.IS_LOADING_APP]: true,
                [ONYXKEYS.CONCIERGE_REPORT_ID]: '',
                [ONYXKEYS.NVP_INTRO_SELECTED]: {},
                [ONYXKEYS.BETAS]: [],
                // Deliberately mismatched flags so the assertion proves each field maps to its own source and they are not swapped.
                // selfTourViewed feeds isSelfTourViewed (true), while hasCompletedGuidedSetupFlow passes through unchanged (false).
                [ONYXKEYS.NVP_ONBOARDING]: {selfTourViewed: true, hasCompletedGuidedSetupFlow: false},
            });
        });

        Linking.setInitialURL(`new-expensify://r/${PUBLIC_ROOM_ID}`);

        render(<DeepLinkHandler onInitialUrl={jest.fn()} />);
        await waitForBatchedUpdatesWithAct();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });
        await waitForBatchedUpdatesWithAct();

        // The combined NVP_ONBOARDING selector feeds both onboarding flags into openReport so guided-setup optimistic data
        // is derived from real Onyx data instead of the deprecated module-level Onyx.connect fallback.
        expect(Report.openReport).toHaveBeenCalledWith(
            expect.objectContaining({
                reportID: PUBLIC_ROOM_ID,
                isSelfTourViewed: true,
                hasCompletedGuidedSetupFlow: false,
            }),
        );
    });

    it('does not refetch when the public room is already present in Onyx', async () => {
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS},
                [ONYXKEYS.IS_LOADING_APP]: true,
                [ONYXKEYS.CONCIERGE_REPORT_ID]: '',
                [ONYXKEYS.NVP_INTRO_SELECTED]: {},
                [ONYXKEYS.BETAS]: [],
                [`${ONYXKEYS.COLLECTION.REPORT}${PUBLIC_ROOM_ID}` as const]: {reportID: PUBLIC_ROOM_ID},
            });
        });

        Linking.setInitialURL(`new-expensify://r/${PUBLIC_ROOM_ID}`);

        render(<DeepLinkHandler onInitialUrl={jest.fn()} />);
        await waitForBatchedUpdatesWithAct();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });
        await waitForBatchedUpdatesWithAct();

        expect(Report.openReport).not.toHaveBeenCalled();
    });

    it('does not refetch for an authenticated user', async () => {
        await act(async () => {
            await Onyx.multiSet({
                // An authToken means hasAuthToken() is true, so the deep link is not tracked as a pending public room.
                [ONYXKEYS.SESSION]: {authToken: 'token', accountID: 1},
                [ONYXKEYS.IS_LOADING_APP]: true,
                [ONYXKEYS.CONCIERGE_REPORT_ID]: '',
                [ONYXKEYS.NVP_INTRO_SELECTED]: {},
                [ONYXKEYS.BETAS]: [],
            });
        });

        Linking.setInitialURL(`new-expensify://r/${PUBLIC_ROOM_ID}`);

        render(<DeepLinkHandler onInitialUrl={jest.fn()} />);
        await waitForBatchedUpdatesWithAct();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });
        await waitForBatchedUpdatesWithAct();

        expect(Report.openReport).not.toHaveBeenCalled();
    });

    it('passes the latest report name-value pairs to warm deep links', async () => {
        // Given warm links must see report metadata loaded after the handler mounted.
        const reportNameValuePairsKey = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${PUBLIC_ROOM_ID}` as const;
        const archivedAt = '2024-01-01 00:00:00.000';
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS},
                [ONYXKEYS.IS_LOADING_APP]: false,
                [ONYXKEYS.CONCIERGE_REPORT_ID]: '',
                [ONYXKEYS.NVP_INTRO_SELECTED]: {},
                [ONYXKEYS.BETAS]: [],
            });
        });
        const addEventListenerSpy = jest.spyOn(Linking, 'addEventListener');

        render(<DeepLinkHandler onInitialUrl={jest.fn()} />);
        await waitForBatchedUpdatesWithAct();
        jest.mocked(openReportFromDeepLink).mockClear();

        await act(async () => {
            await Onyx.set(reportNameValuePairsKey, {private_isArchived: archivedAt});
        });
        await waitForBatchedUpdatesWithAct();

        const urlChangeHandler = addEventListenerSpy.mock.calls.find(([eventType]) => eventType === 'url')?.[1];
        expect(urlChangeHandler).toBeDefined();
        if (!urlChangeHandler) {
            throw new Error('DeepLinkHandler must register its URL listener');
        }
        // When a warm link arrives after the metadata changes.
        await act(async () => {
            urlChangeHandler({url: `new-expensify://r/${PUBLIC_ROOM_ID}`});
        });

        // Then dispatch uses the latest metadata through the existing ref.
        expect(jest.mocked(openReportFromDeepLink).mock.calls.at(-1)?.[8]).toEqual({
            [reportNameValuePairsKey]: {private_isArchived: archivedAt},
        });
        addEventListenerSpy.mockRestore();
    });

    it('preserves every byte of a cold URL including escaping, query, and hash', async () => {
        // Given native Linking returns a full URL rather than an application Route.
        await prepareDeepLinkSession();
        const url = 'new-expensify://r/12345?value=a%2Fb&label=two%20words#receipt';
        jest.spyOn(Linking, 'getInitialURL').mockResolvedValue(url);
        const publishInitialUrl = jest.fn<void, [string | null]>();
        // When the real startup effect resolves the cold link.
        render(<DeepLinkHandler onInitialUrl={publishInitialUrl} />);
        await waitForBatchedUpdatesWithAct();
        // Then startup state and downstream dispatch retain the original URL bytes.
        expect(publishInitialUrl).toHaveBeenCalledTimes(1);
        expect(publishInitialUrl).toHaveBeenCalledWith(url);
        expect(openReportFromDeepLink).toHaveBeenCalledTimes(1);
        const dispatchedUrl = jest.mocked(openReportFromDeepLink).mock.calls.at(0)?.[0];
        expect(dispatchedUrl).toBeDefined();
        expect(dispatchedUrl).toBe(url);
    });

    it('publishes null for an initial URL that resolves without a link', async () => {
        // Given native Linking can successfully resolve to null.
        await prepareDeepLinkSession();
        jest.spyOn(Linking, 'getInitialURL').mockResolvedValue(null);
        const publishInitialUrl = jest.fn<void, [string | null]>();
        // When the real startup effect processes the absence of a link.
        render(<DeepLinkHandler onInitialUrl={publishInitialUrl} />);
        await waitForBatchedUpdatesWithAct();
        // Then navigation can mount with null and public-room checking is unblocked.
        expect(publishInitialUrl).toHaveBeenCalledTimes(1);
        expect(publishInitialUrl).toHaveBeenCalledWith(null);
        expect(openReportFromDeepLink).not.toHaveBeenCalled();
        expect(Report.doneCheckingPublicRoom).toHaveBeenCalled();
    });

    it('publishes null when native initial URL lookup rejects', async () => {
        // Given the native bridge can reject during startup.
        await prepareDeepLinkSession();
        jest.spyOn(Linking, 'getInitialURL').mockRejectedValue(new Error('Native URL unavailable'));
        const publishInitialUrl = jest.fn<void, [string | null]>();
        // When the real startup effect handles the rejected lookup.
        render(<DeepLinkHandler onInitialUrl={publishInitialUrl} />);
        await waitForBatchedUpdatesWithAct();
        // Then the existing null outcome unblocks startup without dispatching a URL.
        expect(publishInitialUrl).toHaveBeenCalledTimes(1);
        expect(publishInitialUrl).toHaveBeenCalledWith(null);
        expect(openReportFromDeepLink).not.toHaveBeenCalled();
        expect(Report.doneCheckingPublicRoom).toHaveBeenCalled();
    });

    it('keeps startup pending until an unresolved lookup reaches the URL timeout', async () => {
        // Given a native bridge lookup that never resolves must not block startup forever.
        await prepareDeepLinkSession();
        jest.useFakeTimers({doNotFake: ['setImmediate', 'nextTick']});
        let lookupStartedAt = 0;
        const initialUrlSpy = jest.spyOn(Linking, 'getInitialURL').mockImplementation(() => {
            lookupStartedAt = Date.now();
            return new Promise<string | null>(() => {});
        });
        const publishInitialUrl = jest.fn<void, [string | null]>();
        render(<DeepLinkHandler onInitialUrl={publishInitialUrl} />);
        await waitFor(() => expect(initialUrlSpy).toHaveBeenCalled());
        // When the real startup timeout reaches its configured boundary.
        const remainingBeforeTimeout = CONST.TIMING.GET_INITIAL_URL_TIMEOUT - (Date.now() - lookupStartedAt);
        await act(async () => {
            await jest.advanceTimersByTimeAsync(remainingBeforeTimeout - 1);
        });
        expect(publishInitialUrl).not.toHaveBeenCalled();
        await act(async () => {
            await jest.advanceTimersByTimeAsync(1);
        });
        // Then null resolves the pending startup state, without manufacturing an empty URL.
        expect(publishInitialUrl).toHaveBeenCalledTimes(1);
        expect(publishInitialUrl).toHaveBeenCalledWith(null);
        expect(openReportFromDeepLink).not.toHaveBeenCalled();
        expect(Report.doneCheckingPublicRoom).toHaveBeenCalled();
    });

    it.each([
        {scenario: 'secure', url: 'new-expensify://r/12345?secureKey=a%2Fb#receipt', shouldUpdateInitialUrl: true},
        {scenario: 'ordinary', url: 'new-expensify://r/12345?value=a%2Fb#receipt', shouldUpdateInitialUrl: false},
    ])('dispatches a $scenario warm URL with the existing initial-state update rule', async ({url, shouldUpdateInitialUrl}) => {
        // Given startup has already resolved without a cold link.
        await prepareDeepLinkSession();
        jest.spyOn(Linking, 'getInitialURL').mockResolvedValue(null);
        const listenerSpy = jest.spyOn(Linking, 'addEventListener');
        const publishInitialUrl = jest.fn<void, [string | null]>();
        render(<DeepLinkHandler onInitialUrl={publishInitialUrl} />);
        await waitForBatchedUpdatesWithAct();
        expect(publishInitialUrl).toHaveBeenCalledWith(null);
        publishInitialUrl.mockClear();
        jest.mocked(openReportFromDeepLink).mockClear();
        const urlListener = listenerSpy.mock.calls.find(([eventType]) => eventType === 'url')?.[1];
        expect(urlListener).toBeDefined();
        if (!urlListener) {
            throw new Error('DeepLinkHandler must register its URL listener');
        }
        // When the captured native URL listener receives the untouched warm link.
        await act(async () => {
            urlListener({url});
        });
        // Then both links dispatch, and only the secure link updates startup URL state.
        expect(openReportFromDeepLink).toHaveBeenCalledTimes(1);
        const dispatchedUrl = jest.mocked(openReportFromDeepLink).mock.calls.at(0)?.[0];
        expect(dispatchedUrl).toBeDefined();
        expect(dispatchedUrl).toBe(url);
        if (shouldUpdateInitialUrl) {
            expect(publishInitialUrl).toHaveBeenCalledTimes(1);
            expect(publishInitialUrl).toHaveBeenCalledWith(url);
        } else {
            expect(publishInitialUrl).not.toHaveBeenCalled();
        }
    });

    it('ignores an initial URL promise that resolves after unmount', async () => {
        // Given the native bridge can finish after the startup handler is removed.
        await prepareDeepLinkSession();
        let resolveInitialUrl: ((url: string | null) => void) | undefined;
        const initialUrlPromise = new Promise<string | null>((resolve) => {
            resolveInitialUrl = resolve;
        });
        const initialUrlSpy = jest.spyOn(Linking, 'getInitialURL').mockReturnValue(initialUrlPromise);
        const publishInitialUrl = jest.fn<void, [string | null]>();
        const {unmount} = render(<DeepLinkHandler onInitialUrl={publishInitialUrl} />);
        await waitForBatchedUpdatesWithAct();
        expect(initialUrlSpy).toHaveBeenCalled();
        expect(publishInitialUrl).not.toHaveBeenCalled();
        expect(resolveInitialUrl).toBeDefined();
        if (!resolveInitialUrl) {
            throw new Error('The controlled native URL promise must expose its resolver');
        }
        const completeInitialUrl = resolveInitialUrl;
        // When the handler unmounts before the native promise resolves.
        unmount();
        await act(async () => {
            completeInitialUrl('new-expensify://r/12345?value=stale#receipt');
            await initialUrlPromise;
        });
        // Then cancellation prevents stale callbacks and downstream dispatch.
        expect(publishInitialUrl).not.toHaveBeenCalled();
        expect(openReportFromDeepLink).not.toHaveBeenCalled();
    });
});
