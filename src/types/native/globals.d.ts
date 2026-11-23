/**
 * Runtime globals that React Native provides on iOS and Android but doesn't type, so the native program can use them
 * without the DOM lib. Each one was confirmed on iOS and Android debug builds (Hermes). Only the parts the App uses are
 * declared, so anything else from the web versions of these APIs stays a native type error on purpose.
 */

// These classes only declare the shape of runtime globals; there is no implementation to split into files.
/* eslint-disable max-classes-per-file */
import type {Pusher as MobilePusher} from '@pusher/pusher-websocket-react-native';

declare global {
    type IdleDeadline = {
        readonly didTimeout: boolean;
        timeRemaining: () => number;
    };

    type IdleRequestCallback = (deadline: IdleDeadline) => void;

    type IdleRequestOptions = {
        timeout?: number;
    };

    // Hermes also has `mark` and `measure`, but the App only reads the clock.
    // eslint-disable-next-line no-var
    var performance: {
        now: () => number;
    };

    function queueMicrotask(callback: () => void): void;

    // Also guaranteed by src/polyfills/requestIdleCallback, which index.js imports before anything else.
    function requestIdleCallback(callback: IdleRequestCallback, options?: IdleRequestOptions): number;
    function cancelIdleCallback(handle: number): void;

    function atob(data: string): string;
    function btoa(data: string): string;

    class TextEncoder {
        readonly encoding: string;

        encode(input?: string): Uint8Array;
    }

    class TextDecoder {
        constructor(label?: string, options?: {fatal?: boolean; ignoreBOM?: boolean});

        readonly encoding: string;

        decode(input?: ArrayBuffer | ArrayBufferView, options?: {stream?: boolean}): string;
    }

    // On native, `window` is the global object itself and has no `document`, so only the debug fields the App sets are added.
    // eslint-disable-next-line no-var
    var window: typeof globalThis & {
        getPusherInstance?: () => MobilePusher | null;
    };

    // React Native sets `navigator` to `{product: 'ReactNative'}` and nothing else.
    // eslint-disable-next-line no-var
    var navigator: {
        readonly product: 'ReactNative';
    };
}

export {};
