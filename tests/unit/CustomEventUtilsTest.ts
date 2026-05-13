import {composeHandlers, createCustomEvent} from '@libs/CustomEventUtils';
import type {CustomEvent, CustomEventHandler} from '@libs/CustomEventUtils';

describe('CustomEventUtils', () => {
    describe('createCustomEvent', () => {
        it('exposes the supplied data on the returned event', () => {
            const event = createCustomEvent({source: 'trigger', kind: 'press'});
            expect(event.source).toBe('trigger');
            expect(event.kind).toBe('press');
        });

        it('starts with defaultPrevented and propagationStopped both false', () => {
            const event = createCustomEvent({});
            expect(event.isDefaultPrevented()).toBe(false);
            expect(event.isPropagationStopped()).toBe(false);
        });

        it('flips defaultPrevented to true after preventDefault()', () => {
            const event = createCustomEvent({});
            event.preventDefault();
            expect(event.isDefaultPrevented()).toBe(true);
            expect(event.isPropagationStopped()).toBe(false);
        });

        it('flips propagationStopped to true after stopPropagation()', () => {
            const event = createCustomEvent({});
            event.stopPropagation();
            expect(event.isPropagationStopped()).toBe(true);
            expect(event.isDefaultPrevented()).toBe(false);
        });

        it('keeps defaultPrevented and propagationStopped independent', () => {
            const event = createCustomEvent({});
            event.preventDefault();
            expect(event.isDefaultPrevented()).toBe(true);
            expect(event.isPropagationStopped()).toBe(false);
            event.stopPropagation();
            expect(event.isDefaultPrevented()).toBe(true);
            expect(event.isPropagationStopped()).toBe(true);
        });

        it('produces independent state across calls', () => {
            const a = createCustomEvent({});
            const b = createCustomEvent({});
            a.preventDefault();
            b.stopPropagation();
            expect(a.isDefaultPrevented()).toBe(true);
            expect(a.isPropagationStopped()).toBe(false);
            expect(b.isDefaultPrevented()).toBe(false);
            expect(b.isPropagationStopped()).toBe(true);
        });

        it('lets a handler read mutated data on the same event reference', () => {
            type Payload = {accumulator: number; [key: string]: unknown};
            const event = createCustomEvent<Payload>({accumulator: 0});
            event.accumulator = 5;
            expect(event.accumulator).toBe(5);
        });
    });

    describe('composeHandlers', () => {
        it('invokes a single handler with the event', () => {
            const handler = jest.fn();
            const event = createCustomEvent({});
            composeHandlers(handler)(event);
            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith(event);
        });

        it('invokes multiple handlers in declared order', () => {
            const calls: string[] = [];
            const a: CustomEventHandler = () => calls.push('a');
            const b: CustomEventHandler = () => calls.push('b');
            const c: CustomEventHandler = () => calls.push('c');
            composeHandlers(a, b, c)(createCustomEvent({}));
            expect(calls).toEqual(['a', 'b', 'c']);
        });

        it('skips undefined and null handler slots gracefully', () => {
            const calls: string[] = [];
            const a: CustomEventHandler = () => calls.push('a');
            const b: CustomEventHandler = () => calls.push('b');
            composeHandlers(a, undefined, null, b)(createCustomEvent({}));
            expect(calls).toEqual(['a', 'b']);
        });

        it('short-circuits subsequent handlers after stopPropagation()', () => {
            const calls: string[] = [];
            const a: CustomEventHandler = () => calls.push('a');
            const b: CustomEventHandler = (event) => {
                calls.push('b');
                event.stopPropagation();
            };
            const c: CustomEventHandler = () => calls.push('c');
            composeHandlers(a, b, c)(createCustomEvent({}));
            expect(calls).toEqual(['a', 'b']);
        });

        it('does NOT short-circuit on preventDefault() alone', () => {
            const calls: string[] = [];
            const a: CustomEventHandler = (event) => {
                calls.push('a');
                event.preventDefault();
            };
            const b: CustomEventHandler = () => calls.push('b');
            composeHandlers(a, b)(createCustomEvent({}));
            expect(calls).toEqual(['a', 'b']);
        });

        it('returns a stable function across calls — composer is reusable', () => {
            const handler = jest.fn();
            const composed = composeHandlers(handler);
            composed(createCustomEvent({}));
            composed(createCustomEvent({}));
            expect(handler).toHaveBeenCalledTimes(2);
        });

        it('is a no-op when zero handlers are passed', () => {
            const event = createCustomEvent({});
            expect(() => composeHandlers()(event)).not.toThrow();
            expect(event.isPropagationStopped()).toBe(false);
        });

        it('preserves the event identity across the chain', () => {
            const seen: Array<CustomEvent<Record<string, unknown>>> = [];
            const a: CustomEventHandler = (event) => seen.push(event);
            const b: CustomEventHandler = (event) => seen.push(event);
            const event = createCustomEvent({tag: 'identity'});
            composeHandlers(a, b)(event);
            expect(seen).toHaveLength(2);
            expect(seen[0]).toBe(seen[1]);
            expect(seen[0]).toBe(event);
        });
    });
});
