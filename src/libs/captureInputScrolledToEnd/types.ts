import type {HostInstance} from 'react-native';

/**
 * Checks whether the focused input inside `content` is scrolled to the end of its text.
 * Returns a function that scrolls it back to the end after a resize, or undefined when there is nothing to keep.
 */
type CaptureInputScrolledToEnd = (content: HostInstance | null) => (() => void) | undefined;

export default CaptureInputScrolledToEnd;
