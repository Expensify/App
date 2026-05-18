import {act, renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

describe('usePrimaryContactMethod', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdates();
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdates();
        });
    });

    it('should return account primaryLogin when set', async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: 'primary@expensify.com'});
            await Onyx.merge(ONYXKEYS.SESSION, {email: 'session@expensify.com'});
            await waitForBatchedUpdates();
        });

        const {result} = renderHook(() => usePrimaryContactMethod());

        expect(result.current).toBe('primary@expensify.com');
    });

    it('should fall back to session email when primaryLogin is absent', async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {});
            await Onyx.merge(ONYXKEYS.SESSION, {email: 'session-only@expensify.com'});
            await waitForBatchedUpdates();
        });

        const {result} = renderHook(() => usePrimaryContactMethod());

        expect(result.current).toBe('session-only@expensify.com');
    });

    it('should return empty string when neither primaryLogin nor session email exist', async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {});
            await Onyx.merge(ONYXKEYS.SESSION, {});
            await waitForBatchedUpdates();
        });

        const {result} = renderHook(() => usePrimaryContactMethod());

        expect(result.current).toBe('');
    });

    it('should return empty string when account and session are unset', async () => {
        const {result} = renderHook(() => usePrimaryContactMethod());

        expect(result.current).toBe('');
    });
});
