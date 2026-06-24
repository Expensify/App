import type {Observer} from 'xstate';

/**
 * Returns an observer usable synchronously even though the downstream observer it forwards to arrives
 * later. Until that observer is ready, every `next` value is buffered, then drained into it in order.
 * A failed load releases the buffer instead of leaking it. `error` and `complete` are dropped until
 * the observer is live, because XState drives inspection through `next` alone.
 *
 * This lets the Stately inspector be code-split behind a dynamic `import()` while the machines it
 * inspects are created synchronously at app start, so no early `@xstate.actor` registration is lost
 * before the inspector chunk loads.
 *
 * @param downstreamReady Resolves to the observer that values are forwarded to, in practice the Stately inspector's `inspect` observer from `createBrowserInspector().inspect`.
 */
function createBufferedObserver<TEvent>(downstreamReady: Promise<Observer<TEvent>>): Observer<TEvent> {
    let downstreamObserver: Observer<TEvent> | undefined;
    let bufferedEvents: TEvent[] | undefined = [];

    downstreamReady.then(
        (observer) => {
            downstreamObserver = observer;
            const pendingEvents = bufferedEvents ?? [];
            bufferedEvents = undefined;
            for (const event of pendingEvents) {
                observer.next?.(event);
            }
        },
        () => {
            bufferedEvents = undefined;
        },
    );

    return {
        next: (event) => {
            if (downstreamObserver) {
                downstreamObserver.next?.(event);
                return;
            }
            bufferedEvents?.push(event);
        },
        error: (error) => downstreamObserver?.error?.(error),
        complete: () => downstreamObserver?.complete?.(),
    };
}

export default createBufferedObserver;
