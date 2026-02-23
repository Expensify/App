import {useRef} from 'react';
import type {FlatList} from 'react-native';
import type {ActionListContextType, ScrollPosition} from '@pages/inbox/ReportScreenContext';

function useActionListContextValue(): ActionListContextType {
    const flatListRef = useRef<FlatList>(null);
    const scrollPositionRef = useRef<ScrollPosition>({});
    const scrollOffsetRef = useRef(0);

    return {flatListRef, scrollPositionRef, scrollOffsetRef};
}

export default useActionListContextValue;
