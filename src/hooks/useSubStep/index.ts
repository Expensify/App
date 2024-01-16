import {useCallback, useRef, useState} from 'react';
import type {UseSubStep} from './types';

export default function useSubStep<T>({bodyContent, onFinished, startFrom = 0}: UseSubStep<T>) {
    const [screenIndex, setScreenIndex] = useState(startFrom);
    const isEditing = useRef(false);

    const prevScreen = useCallback(() => {
        const prevScreenIndex = screenIndex - 1;

        if (prevScreenIndex < 0) {
            return;
        }

        setScreenIndex(prevScreenIndex);
    }, [screenIndex]);

    const nextScreen = useCallback(
        (data?: Record<string, unknown>) => {
            if (isEditing.current) {
                isEditing.current = false;

                setScreenIndex(bodyContent.length - 1);

                return;
            }

            const nextScreenIndex = screenIndex + 1;

            if (nextScreenIndex === bodyContent.length) {
                onFinished(data);
            } else {
                setScreenIndex(nextScreenIndex);
            }
        },
        [screenIndex, bodyContent.length, onFinished],
    );

    const moveTo = useCallback((step: number) => {
        isEditing.current = true;
        setScreenIndex(step);
    }, []);

    const resetScreenIndex = useCallback(() => {
        setScreenIndex(0);
    }, []);

    const goToTheLastStep = useCallback(() => {
        isEditing.current = false;
        setScreenIndex(bodyContent.length - 1);
    }, [bodyContent]);

    return {componentToRender: bodyContent[screenIndex], isEditing: isEditing.current, screenIndex, prevScreen, nextScreen, moveTo, resetScreenIndex, goToTheLastStep};
}
