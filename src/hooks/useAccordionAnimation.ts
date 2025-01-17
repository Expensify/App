import {useEffect} from 'react';
import {useSharedValue} from 'react-native-reanimated';

const useAccordionAnimation = (isExpanded: boolean) => {
    const isAccordionExpanded = useSharedValue(isExpanded);
    const shouldAnimateAccordionSection = useSharedValue(false);
    const hasMounted = useSharedValue(false);

    useEffect(() => {
        isAccordionExpanded.set(isExpanded);
        if (hasMounted.get()) {
            shouldAnimateAccordionSection.set(true);
        } else {
            hasMounted.set(true);
        }
    }, [hasMounted, isAccordionExpanded, isExpanded, shouldAnimateAccordionSection]);

    return {isAccordionExpanded, shouldAnimateAccordionSection};
};

export default useAccordionAnimation;
