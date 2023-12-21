import {useCallback, useRef, useState} from 'react';
import {UseSubStep} from './types';

export default function useSubStep({bodyContent, onFinished, startFrom = 0}: UseSubStep) {
    const [screenIndex, setScreenIndex] = useState(startFrom);
    const isEditing = useRef(false);

    const prevScreen = useCallback(() => {
        const prevScreenIndex = screenIndex - 1;

        if (prevScreenIndex < 0) {
            return;
        }

        setScreenIndex(prevScreenIndex);
    }, [screenIndex]);

    const nextScreen = useCallback(() => {
        if (isEditing.current) {
            isEditing.current = false;

            setScreenIndex(bodyContent.length - 1);

            return;
        }

        const nextScreenIndex = screenIndex + 1;

        if (nextScreenIndex === bodyContent.length) {
            onFinished();
        } else {
            setScreenIndex(nextScreenIndex);
        }
    }, [screenIndex, bodyContent.length, onFinished]);

    const moveTo = useCallback((step: number) => {
        isEditing.current = true;
        setScreenIndex(step);
    }, []);

    const resetScreenIndex = useCallback(() => {
        setScreenIndex(0);
    }, []);

    return {componentToRender: bodyContent[screenIndex], isEditing: isEditing.current, screenIndex, prevScreen, nextScreen, moveTo, resetScreenIndex};
}
