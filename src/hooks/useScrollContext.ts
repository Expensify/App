import {useContext} from 'react';
import {ScrollContext, ScrollContextValue} from '@components/ScrollViewWithContext';

export default function useScrollContext(): ScrollContextValue {
    return useContext(ScrollContext);
}
