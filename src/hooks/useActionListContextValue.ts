import {useRef} from 'react';
import type {FlatList} from 'react-native';
import type {ArchivedReportsIDSet} from '@libs/SearchUIUtils';
import type {ActionListContextType, ScrollPosition} from '@pages/inbox/ReportScreenContext';

function useActionListContextValue(archivedReportsIDSet: ArchivedReportsIDSet): ActionListContextType {
    const flatListRef = useRef<FlatList>(null);
    const scrollPositionRef = useRef<ScrollPosition>({});
    const scrollOffsetRef = useRef(0);

    return {flatListRef, scrollPositionRef, scrollOffsetRef, archivedReportsIDSet};
}

export default useActionListContextValue;
