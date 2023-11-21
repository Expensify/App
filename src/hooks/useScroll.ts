import {useContext} from 'react';
import {ScrollContext, ScrollContextValue} from '@components/ScrollViewWithContext';

export default function useScroll(): ScrollContextValue {
    return useContext(ScrollContext);
}
