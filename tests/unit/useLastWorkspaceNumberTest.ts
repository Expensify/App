import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useLastWorkspaceNumber from '@hooks/useLastWorkspaceNumber';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('useLastWorkspaceNumber', () => {
    const email = 'jdoe@expensify.com';
    const displayName = 'Expensify';
    const workspaceName = `${displayName} Workspace`;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return IntlStore.load(CONST.LOCALES.DEFAULT);
    });

    beforeEach(() => {
        Onyx.clear();
        return waitForBatchedUpdates();
    });

    it('should return the correct last workspace number from Onyx', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {email});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, {name: `${workspaceName} 3`} as Policy);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useLastWorkspaceNumber());

        expect(result.current).toBe(3);
    });

    it('should update when Onyx data changes', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {email});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, {name: `${workspaceName} 3`} as Policy);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useLastWorkspaceNumber());
        expect(result.current).toBe(3);

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}2`, {name: `${workspaceName} 5`} as Policy);
        await waitForBatchedUpdates();

        expect(result.current).toBe(5);
    });

    it('should return undefined if no matching workspaces exist', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {email});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, {name: 'Other Workspace'} as Policy);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useLastWorkspaceNumber());

        expect(result.current).toBeUndefined();
    });
});
