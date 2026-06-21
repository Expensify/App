import type {Ref, RefCallback, RefObject} from 'react';
import mergeRefs from '@libs/mergeRefs';

type Node = {id: string};
const NODE: Node = {id: 'n1'};

describe('mergeRefs', () => {
    describe('assignment to multiple ref shapes', () => {
        it('writes to object refs', () => {
            const a: RefObject<Node | null> = {current: null};
            const b: RefObject<Node | null> = {current: null};
            mergeRefs<Node>(a, b)(NODE);
            expect(a.current).toBe(NODE);
            expect(b.current).toBe(NODE);
        });

        it('calls callback refs with the value', () => {
            const a = jest.fn();
            const b = jest.fn();
            mergeRefs<Node>(a, b)(NODE);
            expect(a).toHaveBeenCalledWith(NODE);
            expect(b).toHaveBeenCalledWith(NODE);
        });

        it('mixes object and callback refs in one call', () => {
            const objectRef: RefObject<Node | null> = {current: null};
            const callbackRef = jest.fn();
            mergeRefs<Node>(objectRef, callbackRef)(NODE);
            expect(objectRef.current).toBe(NODE);
            expect(callbackRef).toHaveBeenCalledWith(NODE);
        });

        it('skips undefined and null ref slots silently', () => {
            const ref: RefObject<Node | null> = {current: null};
            const callback = jest.fn();
            const refs: Array<RefObject<Node | null> | Ref<Node> | undefined | null> = [undefined, ref, null, callback];
            mergeRefs<Node>(...refs)(NODE);
            expect(ref.current).toBe(NODE);
            expect(callback).toHaveBeenCalledWith(NODE);
        });
    });

    describe('cleanup behavior — no callback ref returned a cleanup', () => {
        it('returns undefined (no cleanup needed)', () => {
            const objectRef: RefObject<Node | null> = {current: null};
            const callbackNoReturn = jest.fn();
            const result = mergeRefs<Node>(objectRef, callbackNoReturn)(NODE);
            expect(result).toBeUndefined();
        });
    });

    describe('cleanup behavior — at least one callback ref returned a cleanup', () => {
        it('returns a cleanup that fans out: invokes per-ref cleanups, nulls object refs, nulls plain callback refs', () => {
            const objectRef: RefObject<Node | null> = {current: null};
            const cleanupSpy = jest.fn();
            const callbackWithCleanup: RefCallback<Node> = () => cleanupSpy;
            const callbackNoReturn = jest.fn();

            const merged = mergeRefs<Node>(objectRef, callbackWithCleanup, callbackNoReturn);
            const cleanup = merged(NODE);

            expect(objectRef.current).toBe(NODE);
            expect(typeof cleanup).toBe('function');

            cleanup?.();

            expect(cleanupSpy).toHaveBeenCalledTimes(1);
            expect(objectRef.current).toBeNull();
            expect(callbackNoReturn).toHaveBeenLastCalledWith(null);
        });

        it('invokes the returned per-ref cleanup, not the callback-ref-with-null fallback, when both are present', () => {
            const cleanupSpy = jest.fn();
            const callbackWithCleanup = jest.fn(() => cleanupSpy);

            const cleanup = mergeRefs<Node>(callbackWithCleanup)(NODE);
            expect(callbackWithCleanup).toHaveBeenCalledWith(NODE);
            expect(callbackWithCleanup).toHaveBeenCalledTimes(1);

            cleanup?.();

            expect(cleanupSpy).toHaveBeenCalledTimes(1);
            expect(callbackWithCleanup).toHaveBeenCalledTimes(1);
        });

        it('skips undefined and null slots in the cleanup pass too', () => {
            const cleanupSpy = jest.fn();
            const callbackWithCleanup: RefCallback<Node> = () => cleanupSpy;
            const refs: Array<RefObject<Node | null> | Ref<Node> | undefined | null> = [undefined, callbackWithCleanup, null];
            const cleanup = mergeRefs<Node>(...refs)(NODE);
            expect(() => cleanup?.()).not.toThrow();
            expect(cleanupSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('zero-ref edge case', () => {
        it('does not throw and returns undefined', () => {
            const result = mergeRefs<Node>()(NODE);
            expect(result).toBeUndefined();
        });
    });
});
