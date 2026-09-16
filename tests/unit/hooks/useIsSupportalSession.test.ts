import {renderHook, waitFor} from '@testing-library/react-native';

import useIsSupportalSession from '@hooks/useIsSupportalSession';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

describe('useIsSupportalSession', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    it('fails open (returns false) while SESSION is still loading', () => {
        const {result} = renderHook(() => useIsSupportalSession());

        expect(result.current).toBe(false);
    });

    it('returns false for a regular session', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'token', authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS});

        const {result} = renderHook(() => useIsSupportalSession());

        await waitFor(() => {
            expect(result.current).toBe(false);
        });
    });

    it('returns true once a support authTokenType lands, which the module-level util cannot re-render on', async () => {
        const {result} = renderHook(() => useIsSupportalSession());

        expect(result.current).toBe(false);

        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'token', authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT});

        await waitFor(() => {
            expect(result.current).toBe(true);
        });
    });

    it('returns true when a support auth token is used on a regular session', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'token', isSupportAuthTokenUsed: true});

        const {result} = renderHook(() => useIsSupportalSession());

        await waitFor(() => {
            expect(result.current).toBe(true);
        });
    });
});
