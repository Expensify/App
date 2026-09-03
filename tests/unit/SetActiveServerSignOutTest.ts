import {getActiveServer} from '@libs/ApiUtils';

import {signOutAndRedirectToSignIn} from '@userActions/Session';
import {setActiveServer} from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

jest.mock('@libs/ApiUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/ApiUtils'),
    getActiveServer: jest.fn(),
}));

jest.mock('@userActions/Session', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/Session'),
    signOutAndRedirectToSignIn: jest.fn(),
}));

describe('setActiveServer', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it.each([
        [CONST.SERVER.PRODUCTION, CONST.SERVER.QA],
        [CONST.SERVER.QA, CONST.SERVER.PRODUCTION],
        [CONST.SERVER.STAGING, CONST.SERVER.QA],
    ])('signs out when the switch crosses the QA boundary (%s -> %s)', (from, to) => {
        jest.mocked(getActiveServer).mockReturnValue(from);

        setActiveServer(to);

        expect(signOutAndRedirectToSignIn).toHaveBeenCalledWith(undefined, undefined, undefined, undefined, from);
    });

    it.each([
        [CONST.SERVER.PRODUCTION, CONST.SERVER.STAGING],
        [CONST.SERVER.STAGING, CONST.SERVER.PRODUCTION],
        [CONST.SERVER.QA, CONST.SERVER.QA],
    ])('keeps the session when the switch stays on one side (%s -> %s)', (from, to) => {
        jest.mocked(getActiveServer).mockReturnValue(from);

        setActiveServer(to);

        expect(signOutAndRedirectToSignIn).not.toHaveBeenCalled();
    });

    it('stores the new server either way', async () => {
        jest.mocked(getActiveServer).mockReturnValue(CONST.SERVER.PRODUCTION);

        setActiveServer(CONST.SERVER.QA);

        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.ACTIVE_SERVER,
                callback: (value) => {
                    if (value !== CONST.SERVER.QA) {
                        return;
                    }
                    Onyx.disconnect(connection);
                    resolve();
                },
            });
        });
    });
});
