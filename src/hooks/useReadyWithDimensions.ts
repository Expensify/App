import {useEffect, useState} from 'react';
import {Dimensions} from 'react-native';
import CONST from '@src/CONST';

const useReadyWithDimensions = (isEnabled = true) => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!isEnabled) {
            return;
        }
        const timer = setTimeout(() => {
            setIsReady(true);
        }, CONST.DIMENSIONS_CHANGED_DELAY);

        const handleDimensionChange = () => {
            setIsReady(true);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionChange);

        return () => {
            clearTimeout(timer);
            subscription?.remove();
        };
    }, [isEnabled]);

    return {isReady};
};

export default useReadyWithDimensions;
