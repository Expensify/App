import {use} from 'react';
import {ContentCloseContext} from './ContentContext';

/** Programmatic close (async work completion, deep-link change, etc.). */
function useClosePopover(): () => void {
    const close = use(ContentCloseContext);
    if (close === null) {
        throw new Error('useClosePopover() must be called inside <PopoverMenu.Content>.');
    }
    return close;
}

export default useClosePopover;
