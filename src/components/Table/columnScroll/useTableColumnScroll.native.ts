import type {UseTableColumnScroll} from './types';

/** See ./types: native never scrolls the columns, so there is no offset to mirror. */
const useTableColumnScroll: UseTableColumnScroll = () => null;

export default useTableColumnScroll;
