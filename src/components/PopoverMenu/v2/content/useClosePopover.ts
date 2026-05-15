import {useContentClose} from './ContentContext';

/** Programmatic close escape hatch. */
function useClosePopover(): () => void {
    return useContentClose('useClosePopover');
}

export default useClosePopover;
