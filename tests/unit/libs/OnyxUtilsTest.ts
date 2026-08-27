import fs from 'fs/promises';

import OnyxUtils from '@libs/OnyxUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

jest.mock('react-native-onyx', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
    },
}));

type OnyxWithGet = {
    get: jest.Mock;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const mockOnyxGet = (Onyx as unknown as OnyxWithGet).get;

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const asOnyxKey = (key: string) => key as OnyxKey;

describe('OnyxUtils', () => {
    it('keeps the eslint deny-list in step with CONST.SEARCH.SNAPSHOT_ONYX_KEYS', async () => {
        const config = await fs.readFile('config/eslint/eslint.config.mjs', 'utf8');
        const block = /forbiddenKeys: \[([^\]]*)\]/.exec(config)?.at(1) ?? '';
        const configured = [...block.matchAll(/'([^']+)'/g)].map(([, path]) => path.replace('ONYXKEYS.', ''));

        const resolve = (path: string) => path.split('.').reduce<unknown>((value, part) => (value as Record<string, unknown>)?.[part], ONYXKEYS);

        // The rule matches on the written key path, so the list is dotted paths rather than values.
        // Resolving them against ONYXKEYS is what proves the two lists describe the same keys.
        expect(configured.map(resolve)).toEqual([...CONST.SEARCH.SNAPSHOT_ONYX_KEYS]);
    });

    beforeEach(() => {
        mockOnyxGet.mockReset();
    });

    describe('get', () => {
        it('throws when reading a Search snapshot collection key', () => {
            for (const key of CONST.SEARCH.SNAPSHOT_ONYX_KEYS) {
                expect(() => OnyxUtils.get(asOnyxKey(key))).toThrow('Onyx.get is not allowed for Search snapshot keys');
            }
            expect(mockOnyxGet).not.toHaveBeenCalled();
        });

        it('throws when reading a member of a Search snapshot collection', () => {
            expect(() => OnyxUtils.get(asOnyxKey(`${ONYXKEYS.COLLECTION.REPORT}123`))).toThrow('Onyx.get is not allowed for Search snapshot keys');
            expect(mockOnyxGet).not.toHaveBeenCalled();
        });

        it('blocks any key `useOnyx` would redirect, including prefix matches on a non-collection key', () => {
            expect(() => OnyxUtils.get(asOnyxKey(`${ONYXKEYS.PERSONAL_DETAILS_LIST}Draft`))).toThrow('Onyx.get is not allowed for Search snapshot keys');
            expect(mockOnyxGet).not.toHaveBeenCalled();
        });

        it('delegates allowed keys to react-native-onyx', async () => {
            mockOnyxGet.mockResolvedValue('session-value');

            const value = await OnyxUtils.get(ONYXKEYS.SESSION);

            expect(mockOnyxGet).toHaveBeenCalledWith(ONYXKEYS.SESSION);
            expect(value).toBe('session-value');
        });
    });
});
