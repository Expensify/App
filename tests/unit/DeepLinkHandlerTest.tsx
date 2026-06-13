import {act, render} from '@testing-library/react-native';
import {Linking} from 'react-native';
import Onyx from 'react-native-onyx';
import type * as Link from '@libs/actions/Link';
import * as Report from '@libs/actions/Report';
import CONST from '@src/CONST';
import DeepLinkHandler from '@src/DeepLinkHandler';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/actions/Link', () => ({
    ...jest.requireActual<typeof Link>('@libs/actions/Link'),
    openReportFromDeepLink: jest.fn(),
}));

jest.mock('@libs/actions/Report', () => ({
    ...jest.requireActual<typeof Report>('@libs/actions/Report'),
    openReport: jest.fn(),
    doneCheckingPublicRoom: jest.fn(),
}));

const PUBLIC_ROOM_ID = '987654321';
const DEFAULT_URL = 'https://new.expensify.com/';

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

    it('does not refetch when the public room is already present in Onyx', async () => {
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS},
                [ONYXKEYS.IS_LOADING_APP]: true,
                [ONYXKEYS.CONCIERGE_REPORT_ID]: '',
                [ONYXKEYS.NVP_INTRO_SELECTED]: {},
                [ONYXKEYS.BETAS]: [],
                [`${ONYXKEYS.COLLECTION.REPORT}${PUBLIC_ROOM_ID}`]: {reportID: PUBLIC_ROOM_ID},
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
});
