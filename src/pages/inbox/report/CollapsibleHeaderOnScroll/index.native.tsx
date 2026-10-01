import type {CollapsibleHeaderOnScrollProps} from './types';

/**
 * Native no-op — renders children as-is. Scrolling the report header away is a mobile web only treatment: native
 * isn't competing with the browser's URL bar for vertical space, and it keeps the pinned header in landscape (the
 * same split as useShouldUseCompactChatChrome). Collapsing the header for the keyboard is handled on native by
 * CollapsibleHeaderOnKeyboard, which is in turn a no-op on web.
 */
function CollapsibleHeaderOnScroll({children}: CollapsibleHeaderOnScrollProps) {
    return children;
}

export default CollapsibleHeaderOnScroll;
