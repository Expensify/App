import type {OnyxCollection} from 'react-native-onyx';
import getCollectionDelta from '@libs/getCollectionDelta';

type Item = {v: number};

describe('getCollectionDelta', () => {
    it('should return undefined when current and previous are the same reference', () => {
        const collection: OnyxCollection<Item> = {a: {v: 1}};
        expect(getCollectionDelta(collection, collection)).toBeUndefined();
    });

    it('should return undefined when both snapshots are undefined', () => {
        expect(getCollectionDelta(undefined, undefined)).toBeUndefined();
    });

    it('should return undefined when no member changed, even if the container objects differ (structural sharing)', () => {
        const a: Item = {v: 1};
        const b: Item = {v: 2};
        // Different container objects, but every member keeps its reference.
        expect(getCollectionDelta({a, b}, {a, b})).toBeUndefined();
    });

    it('should report an added member and omit unchanged ones', () => {
        const a: Item = {v: 1};
        const b: Item = {v: 2};
        const delta = getCollectionDelta({a, b}, {a});
        expect(delta).toStrictEqual({b});
    });

    it('should report a changed member with its current value', () => {
        const a: Item = {v: 1};
        const aNext: Item = {v: 99};
        const delta = getCollectionDelta({a: aNext}, {a});
        expect(delta).toStrictEqual({a: aNext});
        expect(delta?.a).toBe(aNext);
    });

    it('should report a removed member as undefined (key present)', () => {
        const a: Item = {v: 1};
        const b: Item = {v: 2};
        const delta = getCollectionDelta({a}, {a, b});
        expect(delta).toStrictEqual({b: undefined});
        expect(delta).toHaveProperty('b');
    });

    it('should treat a missing previous snapshot as empty, so every member is added', () => {
        const a: Item = {v: 1};
        const b: Item = {v: 2};
        expect(getCollectionDelta({a, b}, undefined)).toStrictEqual({a, b});
    });

    it('should treat a missing current snapshot as empty, so every member is removed', () => {
        const a: Item = {v: 1};
        const b: Item = {v: 2};
        expect(getCollectionDelta(undefined, {a, b})).toStrictEqual({a: undefined, b: undefined});
    });

    it('should include only added/changed/removed members in a mixed diff', () => {
        const unchanged: Item = {v: 1};
        const before: Item = {v: 2};
        const after: Item = {v: 3};
        const removed: Item = {v: 4};
        const added: Item = {v: 5};

        const delta = getCollectionDelta({unchanged, changed: after, added}, {unchanged, changed: before, removed});

        expect(delta).toStrictEqual({changed: after, added, removed: undefined});
        expect(delta?.changed).toBe(after);
        expect(delta).not.toHaveProperty('unchanged');
    });

    it('should use reference equality, not deep equality (a re-created but deep-equal member counts as changed)', () => {
        const delta = getCollectionDelta({a: {v: 1}}, {a: {v: 1}});
        expect(delta).toHaveProperty('a');
        expect(delta?.a).toEqual({v: 1});
    });

    it('should report a member explicitly set to null, distinct from a removed member', () => {
        const a: Item = {v: 1};
        const delta = getCollectionDelta({a: null}, {a});
        expect(delta).toStrictEqual({a: null});
    });

    it('should omit a member that is null in both snapshots', () => {
        expect(getCollectionDelta({a: null}, {a: null})).toBeUndefined();
    });
});
