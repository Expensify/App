import type {FP} from 'group-ib-fp';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function enableCapabilities(_: FP): void {
    // no-op on the web and desktop. Only available on native.
}

export default enableCapabilities;
