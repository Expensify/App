import DisplayContentsView from '@components/DisplayContentsView';

import type CustomViewWrapperProps from './types';

/**
 * Keeps children painted while React hides the surrounding subtree and takes covered content out of the tab order.
 * The host element is pinned to `display: contents`, so it generates no box and needs no layout style, unlike the
 * native variant.
 */
function CustomViewWrapper({inert, children}: CustomViewWrapperProps) {
    return <DisplayContentsView inert={inert}>{children}</DisplayContentsView>;
}

export default CustomViewWrapper;
