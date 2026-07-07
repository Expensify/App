import type {SplitListItemType} from '@components/SelectionList/ListItem/types';
import type {SelectionListHandle} from '@components/SelectionList/types';

import type {RefObject} from 'react';

type UseHandleInputFocusProps = {
    listRef: RefObject<SelectionListHandle<SplitListItemType> | null>;
};

export default UseHandleInputFocusProps;
