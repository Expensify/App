import type {IsCurrentTargetInsideContainerType} from './types';

const isCurrentTargetInsideContainer: IsCurrentTargetInsideContainerType = (event, containerRef) => {
    // The related target check is required here
    // because without it when we select an option, the onBlur will still trigger setting displayListViewBorder to false
    // it will make the auto complete component re-render before onPress is called making selecting an option not working.
    if (!containerRef.current || !event.target || !('relatedTarget' in event) || !('contains' in containerRef.current)) {
        return false;
    }

    return !!containerRef.current.contains(event.relatedTarget as Node);
};

export default isCurrentTargetInsideContainer;
