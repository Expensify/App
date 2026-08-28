import Log from '@libs/Log';
import OnyxUtils from '@libs/OnyxUtils';
import type {ReadableOnyxKey} from '@libs/OnyxUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

// `get` refuses the Search snapshot keys in its own signature, so reaching the runtime guard at all means
// getting a banned key past the type. Everything below this cast is testing what a `string` from outside
// TypeScript does when it arrives at a call site the compiler already cleared.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const asOnyxKey = (key: string) => key as ReadableOnyxKey;

describe('OnyxUtils.get', () => {
    const libraryGet = jest.spyOn(Onyx, 'get');

    beforeEach(async () => {
        await Onyx.clear();
        libraryGet.mockClear();
    });

    afterAll(() => {
        libraryGet.mockRestore();
    });

    describe('keys it refuses', () => {
        it('throws for every Search snapshot key', () => {
            for (const key of CONST.SEARCH.SNAPSHOT_ONYX_KEYS) {
                expect(() => OnyxUtils.get(asOnyxKey(key))).toThrow('not allowed for Search snapshot keys');
            }

            expect(libraryGet).not.toHaveBeenCalled();
        });

        it('throws for a member of a Search snapshot collection', () => {
            expect(() => OnyxUtils.get(asOnyxKey(`${ONYXKEYS.COLLECTION.REPORT}123`))).toThrow('not allowed for Search snapshot keys');
            expect(libraryGet).not.toHaveBeenCalled();
        });

        it('throws for a prefix match on a non-collection key, which `useOnyx` also redirects', () => {
            expect(() => OnyxUtils.get(asOnyxKey(`${ONYXKEYS.PERSONAL_DETAILS_LIST}Draft`))).toThrow('not allowed for Search snapshot keys');
            expect(libraryGet).not.toHaveBeenCalled();
        });

        it('throws synchronously, so a caller cannot catch it off the returned promise', () => {
            expect(() => {
                OnyxUtils.get(asOnyxKey(ONYXKEYS.PERSONAL_DETAILS_LIST)).catch(() => undefined);
            }).toThrow('not allowed for Search snapshot keys');
        });
    });

    describe('keys it refuses at compile time', () => {
        it('rejects a Search snapshot key in the signature', () => {
            // @ts-expect-error a collection key on the deny-list is not a ReadableOnyxKey
            expect(() => OnyxUtils.get(ONYXKEYS.COLLECTION.REPORT)).toThrow();
            // @ts-expect-error a non-collection key on the deny-list is not a ReadableOnyxKey
            expect(() => OnyxUtils.get(ONYXKEYS.PERSONAL_DETAILS_LIST)).toThrow();
            // @ts-expect-error a collection member resolves to `report_${string}`, which the deny-list covers
            expect(() => OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT}123`)).toThrow();
            const readAnyKey = (anyKey: OnyxKey) => {
                // @ts-expect-error a plain OnyxKey could be any key, so a caller has to narrow it first
                return OnyxUtils.get(anyKey);
            };

            expect(() => readAnyKey(ONYXKEYS.SESSION)).not.toThrow();
        });
    });

    describe('keys it refuses, in a production bundle', () => {
        // `jest.replaceProperty` cannot name `__DEV__`, which is declared as a global rather than a property of
        // `globalThis`, so the define is redeclared instead.
        const setDevMode = (value: boolean) => {
            Object.defineProperty(globalThis, '__DEV__', {value, configurable: true, writable: true});
        };

        beforeEach(() => {
            setDevMode(false);
        });

        afterEach(() => {
            setDevMode(true);
            jest.restoreAllMocks();
        });

        it('reports and reads through rather than throwing', async () => {
            const alert = jest.spyOn(Log, 'alert').mockImplementation(() => {});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {reportID: '1'});

            await expect(OnyxUtils.get(asOnyxKey(`${ONYXKEYS.COLLECTION.REPORT}1`))).resolves.toEqual({reportID: '1'});
            expect(alert).toHaveBeenCalledWith('OnyxUtils.get read a Search snapshot key, which useOnyx would have redirected', {key: `${ONYXKEYS.COLLECTION.REPORT}1`});
        });

        it('leaves an allowed key alone, reporting nothing', async () => {
            const alert = jest.spyOn(Log, 'alert').mockImplementation(() => {});
            await Onyx.set(ONYXKEYS.SESSION, {accountID: 42});

            await expect(OnyxUtils.get(ONYXKEYS.SESSION)).resolves.toEqual({
                accountID: 42,
            });
            expect(alert).not.toHaveBeenCalled();
        });
    });

    describe('keys it allows', () => {
        it('resolves the value the key holds', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {accountID: 42});

            await expect(OnyxUtils.get(ONYXKEYS.SESSION)).resolves.toEqual({
                accountID: 42,
            });
        });

        it('resolves undefined when the key holds nothing', async () => {
            await expect(OnyxUtils.get(ONYXKEYS.SESSION)).resolves.toBeUndefined();
        });

        it('resolves a whole collection, for a collection the deny-list does not cover', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}1`, {
                Tag: {name: 'Tag', required: false, tags: {}},
            });

            await expect(OnyxUtils.get(ONYXKEYS.COLLECTION.POLICY_TAGS)).resolves.toEqual({
                [`${ONYXKEYS.COLLECTION.POLICY_TAGS}1`]: {
                    Tag: {name: 'Tag', required: false, tags: {}},
                },
            });
        });
    });
});
