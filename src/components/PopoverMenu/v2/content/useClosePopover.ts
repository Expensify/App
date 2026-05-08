import {use} from 'react';
import {ContentCloseContext} from './ContentContext';

/** Programmatic close — for descendants that need to close the popover from custom logic (async work completion, deep-link change, etc.). */
function useClosePopover(): () => void {
    const close = use(ContentCloseContext);
    if (close === null) {
        throw new Error('useClosePopover() must be called inside <PopoverMenu.Content>.');
    }
    return close;
}

export default useClosePopover;
