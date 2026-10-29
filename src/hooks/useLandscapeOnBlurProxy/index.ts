import type {UseLandscapeOnBlurProxy} from './types';

// The rotation-refocus workaround is only needed on Android — iOS and web don't lose focus
// when the orientation flips, so we pass the caller's onBlur through unchanged.
const useLandscapeOnBlurProxy: UseLandscapeOnBlurProxy = (_inputRef, onBlur) => onBlur;

export default useLandscapeOnBlurProxy;
