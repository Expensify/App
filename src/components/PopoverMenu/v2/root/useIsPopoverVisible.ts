import {use} from 'react';
import {RootStateContext} from './RootContext';

/** Read-only `Root.isVisible` — for descendants that render trigger UI based on popover state. */
function useIsPopoverVisible(): boolean {
    const value = use(RootStateContext);
    if (!value) {
        throw new Error('useIsPopoverVisible() must be called inside <PopoverMenu.Root>.');
    }
    return value.state.isVisible;
}

export default useIsPopoverVisible;
