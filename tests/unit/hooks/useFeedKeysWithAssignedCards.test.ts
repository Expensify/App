/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {WorkspaceCardsList} from '@src/types/onyx';
import {createRandomExpensifyCard} from '../../utils/collections/card';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

describe('useFeedKeysWithAssignedCards', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('should return empty object when no workspace cards exist', () => {
        const {result} = renderHook(() => useFeedKeysWithAssignedCards());

        expect(result.current).toEqual({});
    });

    it('should return a feed key when a feed has an assigned card', async () => {
        const card = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});
        const workspaceCards: WorkspaceCardsList = {'1': card};

        await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}12345_${CONST.EXPENSIFY_CARD.BANK}`, workspaceCards);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useFeedKeysWithAssignedCards());

        expect(result.current).toEqual({'12345_Expensify Card': true});
    });

    it('should return multiple feed keys when multiple feeds have assigned cards', async () => {
        const card1 = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});
        const card2 = createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});

        await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}111_${CONST.EXPENSIFY_CARD.BANK}`, {'1': card1} as WorkspaceCardsList);
        await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}222_oauth.chase.com`, {'2': card2} as WorkspaceCardsList);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useFeedKeysWithAssignedCards());

        expect(result.current).toEqual({
            '111_Expensify Card': true,
            '222_oauth.chase.com': true,
        });
    });

    it('should not include feeds with empty card lists', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}12345_${CONST.EXPENSIFY_CARD.BANK}`, {} as WorkspaceCardsList);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useFeedKeysWithAssignedCards());

        expect(result.current).toEqual({});
    });

    it('should update when a new card is assigned to a feed', async () => {
        const card1 = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});
        await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}12345_${CONST.EXPENSIFY_CARD.BANK}`, {'1': card1} as WorkspaceCardsList);
        await waitForBatchedUpdates();

        const {result, rerender} = renderHook(() => useFeedKeysWithAssignedCards());
        expect(result.current).toEqual({'12345_Expensify Card': true});

        const card2 = createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});
        await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}99999_oauth.chase.com`, {'2': card2} as WorkspaceCardsList);
        await waitForBatchedUpdates();

        rerender({});
        expect(result.current).toEqual({'12345_Expensify Card': true, '99999_oauth.chase.com': true});
    });
});
