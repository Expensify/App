import {useEffect, useRef} from 'react';
import type {UseInitialListEventMocks} from '@components/InvertedFlatList/BaseInvertedFlatList/useInitialListEventMocks';

const useInitialListEventMocks: UseInitialListEventMocks = ({handleStartReached, handleContentSizeChange}) => {
    const didTriggerEvents = useRef(false);

    useEffect(() => {
        if (didTriggerEvents.current) {
            return;
        }
        handleStartReached({distanceFromStart: 0});
        handleContentSizeChange(0, 0);
        didTriggerEvents.current = true;
    }, [handleStartReached, handleContentSizeChange]);
};

export default useInitialListEventMocks;
