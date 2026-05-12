import useAssertedContext from '@hooks/useAssertedContext';
import {RootVisibilityContext} from './RootContext';

function useIsPopoverVisible(): boolean {
    return useAssertedContext(RootVisibilityContext, 'useIsPopoverVisible', '<PopoverMenu.Root>').isVisible;
}

export default useIsPopoverVisible;
