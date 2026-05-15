import useAssertedContext from '@hooks/useAssertedContext';
import {ContentCloseContext} from './ContentContext';

/** Programmatic close escape hatch. */
function useClosePopover(): () => void {
    return useAssertedContext(ContentCloseContext, 'useClosePopover', '<PopoverMenu.Content>');
}

export default useClosePopover;
