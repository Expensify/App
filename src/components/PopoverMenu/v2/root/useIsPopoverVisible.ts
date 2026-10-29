import {useRootVisibility} from './RootContext';

function useIsPopoverVisible(): boolean {
    return useRootVisibility('useIsPopoverVisible').isVisible;
}

export default useIsPopoverVisible;
