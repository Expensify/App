import {useEffect} from 'react';
import {useSharedValue} from 'react-native-reanimated';

/**
 * @returns two values: isExpanded, which manages the expansion of the accordion component,
 * and shouldAnimateAccordionSection, which determines whether we should animate
 * the expanding and collapsing of the accordion based on changes in isExpanded.
 */
function useAccordionAnimation(isExpanded: boolean) {
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
}

export default useAccordionAnimation;
