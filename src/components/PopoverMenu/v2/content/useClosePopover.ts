import useAssertedContext from '@hooks/useAssertedContext';
import {ContentCloseContext} from './ContentContext';

/** Programmatic close (async work completion, deep-link change, etc.). */
function useClosePopover(): () => void {
    return useAssertedContext(ContentCloseContext, 'useClosePopover', '<PopoverMenu.Content>');
}

export default useClosePopover;
