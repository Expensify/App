import Onyx from 'react-native-onyx';
import EmojiReactionKeysToHexcode from '@libs/migrations/EmojiReactionKeysToHexcode';
import ONYXKEYS from '@src/ONYXKEYS';
import type ReportActionReactions from '@src/types/onyx/ReportActionReactions';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../../utils/wrapOnyxWithWaitForBatchedUpdates';

const REPORT_ACTION_ID = 'action1';

function getReactionsFromOnyx(reportActionID: string): Promise<ReportActionReactions | undefined> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value ?? undefined);
            },
        });
    });
}

describe('EmojiReactionKeysToHexcode', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
        }),
    );

    beforeEach(() => {
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        return waitForBatchedUpdates();
    });

    afterEach(() => Onyx.clear());

    it('renames a name-keyed reaction to its hexcode', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${REPORT_ACTION_ID}`, {
            '+1': {
                createdAt: '2024-01-01T00:00:00.000Z',
                oldestTimestamp: '2024-01-01T00:00:00.000Z',
                users: {
                    '12345': {
                        id: '12345',
                        skinTones: {[-1]: '2024-01-01T00:00:00.000Z'},
                        oldestTimestamp: '2024-01-01T00:00:00.000Z',
                    },
                },
            },
        });

        await EmojiReactionKeysToHexcode();
        await waitForBatchedUpdates();

        const result = await getReactionsFromOnyx(REPORT_ACTION_ID);
        expect(result).toBeDefined();
        expect(result?.['1F44D']).toBeDefined();
        expect(result?.['+1']).toBeUndefined();
        expect(result?.['1F44D']?.createdAt).toBe('2024-01-01T00:00:00.000Z');
        expect(result?.['1F44D']?.users?.['12345']).toBeDefined();
    });

    it('leaves hex-keyed reactions unchanged while renaming name-keyed ones', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${REPORT_ACTION_ID}`, {
            '+1': {
                createdAt: '2024-01-01T00:00:00.000Z',
                oldestTimestamp: '2024-01-01T00:00:00.000Z',
                users: {'12345': {id: '12345', skinTones: {[-1]: '2024-01-01T00:00:00.000Z'}, oldestTimestamp: '2024-01-01T00:00:00.000Z'}},
            },
            '1F602': {
                createdAt: '2024-01-02T00:00:00.000Z',
                oldestTimestamp: '2024-01-02T00:00:00.000Z',
                users: {'67890': {id: '67890', skinTones: {[-1]: '2024-01-02T00:00:00.000Z'}, oldestTimestamp: '2024-01-02T00:00:00.000Z'}},
            },
        });

        await EmojiReactionKeysToHexcode();
        await waitForBatchedUpdates();

        const result = await getReactionsFromOnyx(REPORT_ACTION_ID);
        expect(result?.['1F44D']).toBeDefined();
        expect(result?.['+1']).toBeUndefined();
        expect(result?.['1F602']).toBeDefined();
    });

    it('merges colliding renames keeping the earliest createdAt and union of users', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${REPORT_ACTION_ID}`, {
            '+1': {
                createdAt: '2024-01-01T00:00:00.000Z',
                oldestTimestamp: '2024-01-01T00:00:00.000Z',
                users: {'123': {id: '123', skinTones: {[-1]: '2024-01-01T00:00:00.000Z'}, oldestTimestamp: '2024-01-01T00:00:00.000Z'}},
            },
            ':+1:': {
                createdAt: '2024-02-01T00:00:00.000Z',
                oldestTimestamp: '2024-02-01T00:00:00.000Z',
                users: {'456': {id: '456', skinTones: {[-1]: '2024-02-01T00:00:00.000Z'}, oldestTimestamp: '2024-02-01T00:00:00.000Z'}},
            },
        });

        await EmojiReactionKeysToHexcode();
        await waitForBatchedUpdates();

        const result = await getReactionsFromOnyx(REPORT_ACTION_ID);
        expect(result?.['1F44D']).toBeDefined();
        expect(result?.['+1']).toBeUndefined();
        expect(result?.[':+1:']).toBeUndefined();
        expect(result?.['1F44D']?.createdAt).toBe('2024-01-01T00:00:00.000Z');
        expect(result?.['1F44D']?.users?.['123']).toBeDefined();
        expect(result?.['1F44D']?.users?.['456']).toBeDefined();
    });

    it('preserves unknown emoji names unchanged', async () => {
        const unknownReaction = {
            createdAt: '2024-01-01T00:00:00.000Z',
            oldestTimestamp: '2024-01-01T00:00:00.000Z',
            users: {'12345': {id: '12345', skinTones: {[-1]: '2024-01-01T00:00:00.000Z'}, oldestTimestamp: '2024-01-01T00:00:00.000Z'}},
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${REPORT_ACTION_ID}`, {made_up: unknownReaction});

        await EmojiReactionKeysToHexcode();
        await waitForBatchedUpdates();

        const result = await getReactionsFromOnyx(REPORT_ACTION_ID);
        expect(result?.['made_up']).toBeDefined();
    });

    it('is a no-op when no reaction data exists', async () => {
        await EmojiReactionKeysToHexcode();
        await waitForBatchedUpdates();

        const result = await getReactionsFromOnyx(REPORT_ACTION_ID);
        expect(result).toBeUndefined();
    });

    it('is a no-op when all reactions are already hex-keyed', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${REPORT_ACTION_ID}`, {
            '1F44D': {
                createdAt: '2024-01-01T00:00:00.000Z',
                oldestTimestamp: '2024-01-01T00:00:00.000Z',
                users: {'12345': {id: '12345', skinTones: {[-1]: '2024-01-01T00:00:00.000Z'}, oldestTimestamp: '2024-01-01T00:00:00.000Z'}},
            },
        });

        await EmojiReactionKeysToHexcode();
        await waitForBatchedUpdates();

        const result = await getReactionsFromOnyx(REPORT_ACTION_ID);
        expect(result?.['1F44D']).toBeDefined();
    });
});
