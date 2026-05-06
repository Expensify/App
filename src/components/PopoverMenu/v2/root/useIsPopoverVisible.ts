import {use} from 'react';
import {RootStateContext} from './RootContext';

/**
 * Returns whether the enclosing `<Root>`'s popover is currently open. Read-only — for callers that want
 * to render trigger affordances (e.g. an active-state icon color) based on the popover's visibility.
 */
function useIsPopoverVisible(): boolean {
    const value = use(RootStateContext);
    if (!value) {
        throw new Error('useIsPopoverVisible() must be called inside <PopoverMenu.Root>.');
    }
    return value.state.isVisible;
}

export default useIsPopoverVisible;
