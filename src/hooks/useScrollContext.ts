import {useContext} from 'react';
import type {ScrollContextValue} from '@components/ScrollViewWithContext';
import {ScrollContext} from '@components/ScrollViewWithContext';

export default function useScrollContext(): ScrollContextValue {
    return useContext(ScrollContext);
}
