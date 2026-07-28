import type {ScrollContextValue} from '@components/ScrollViewWithContext';
import {ScrollContext} from '@components/ScrollViewWithContext';

import {useContext} from 'react';

export default function useScrollContext(): ScrollContextValue {
    return useContext(ScrollContext);
}
