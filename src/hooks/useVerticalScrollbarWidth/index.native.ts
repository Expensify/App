import type UseVerticalScrollbarWidth from './types';

/**
 * Native scroll indicators float above the content and never take width from it.
 */
const useVerticalScrollbarWidth: UseVerticalScrollbarWidth = () => ({scrollbarWidth: 0, measureScrollbarRef: () => {}});

export default useVerticalScrollbarWidth;
